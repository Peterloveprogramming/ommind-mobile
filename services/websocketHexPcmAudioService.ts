import { SECRET_TOKEN, TEXT_TO_AUDIO_URL } from "@/constant";
import { HexPcmAudioPlayer, PlaybackStatus } from "@/services/hexPcmAudioPlayer";
import * as Sentry from "@sentry/react-native";

export type ConnectionStatus = "idle" | "connecting" | "open" | "closed" | "error";
type RNWebSocketCtor = new (
  url: string,
  protocols?: string | string[] | null,
  options?: { headers?: Record<string, string> }
) => WebSocket;

export type PlayAudioInput = string | ({ text: string } & Record<string, unknown>);

export type WebsocketHexPcmAudioServiceOptions = {
  wsUrl?: string;
  authorization?: string;
  fileFormat?: string;
  logRawData?: boolean;
  audioPlayer?: HexPcmAudioPlayer;
  onStatusChange?: (status: ConnectionStatus) => void;
  onPlaybackStatusChange?: (status: PlaybackStatus) => void;
  onError?: (error: unknown) => void;
};

type WebSocketDiagnosticData = Record<string, string | number | boolean | null | undefined>;

type ReportedWebSocketError = Error & {
  diagnostics?: WebSocketDiagnosticData;
};

const sanitizeWsUrlForDiagnostics = (wsUrl: string): WebSocketDiagnosticData => {
  try {
    const parsedUrl = new URL(wsUrl);

    return {
      wsUrlProtocol: parsedUrl.protocol,
      wsUrlHost: parsedUrl.host,
      wsUrlPath: parsedUrl.pathname,
      wsUrlHasQuery: parsedUrl.search.length > 0,
    };
  } catch {
    return {
      wsUrlParseFailed: true,
    };
  }
};

const getWebSocketEventDiagnostics = (event: unknown): WebSocketDiagnosticData => {
  if (!event || typeof event !== "object") {
    return {
      eventValue: String(event),
    };
  }

  const eventRecord = event as Record<string, unknown>;
  const diagnostics: WebSocketDiagnosticData = {};

  for (const key of ["type", "message", "code", "reason", "wasClean"]) {
    const value = eventRecord[key];
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      diagnostics[`event_${key}`] = value;
    }
  }

  return diagnostics;
};

const makeWebSocketError = (
  message: string,
  diagnostics: WebSocketDiagnosticData,
  cause?: unknown
) => {
  const error = new Error(message, { cause }) as ReportedWebSocketError;
  error.diagnostics = diagnostics;
  return error;
};

const captureWebSocketFailure = (
  error: ReportedWebSocketError,
  diagnostics: WebSocketDiagnosticData
) => {
  console.error("[ws-audio] websocket failure", diagnostics, error.message);
  Sentry.captureException(error, {
    tags: {
      feature: "websocket_audio",
      ws_protocol: String(diagnostics.wsUrlProtocol ?? "unknown"),
      ws_host: String(diagnostics.wsUrlHost ?? "unknown"),
    },
    contexts: {
      websocket_audio: diagnostics,
    },
  });
};

export class WebsocketHexPcmAudioService {
  private readonly wsUrl: string;
  private readonly authorization?: string;
  private readonly fileFormat: string;
  private readonly logRawData: boolean;
  private readonly onStatusChange?: (status: ConnectionStatus) => void;
  private readonly onPlaybackStatusChange?: (status: PlaybackStatus) => void;
  private readonly onError?: (error: unknown) => void;

  private readonly audioPlayer: HexPcmAudioPlayer;

  private socket: WebSocket | null = null;
  private connectPromise: Promise<void> | null = null;
  private status: ConnectionStatus = "idle";
  
  constructor(options: WebsocketHexPcmAudioServiceOptions = {}) {
    this.wsUrl = options.wsUrl ?? TEXT_TO_AUDIO_URL;
    this.authorization = options.authorization ?? SECRET_TOKEN;
    this.fileFormat = options.fileFormat ?? "pcm";
    this.logRawData = options.logRawData ?? false;
    this.onPlaybackStatusChange = options.onPlaybackStatusChange;
    this.audioPlayer =
      options.audioPlayer ??
      new HexPcmAudioPlayer({
        onPlaybackStatusChange: (status) => {
          this.onPlaybackStatusChange?.(status);
        },
      });
    this.onStatusChange = options.onStatusChange;
    this.onError = options.onError;
  }

  get connectionStatus(): ConnectionStatus {
    return this.status;
  }

  async connect(): Promise<void> {
    await this.ensureConnected();
  }

  async playAudio(input: PlayAudioInput): Promise<void> {
    const payload = this.normalizePayload(input);
    await this.audioPlayer.beginStream();
    await this.ensureConnected();
    this.socket?.send(JSON.stringify(payload));
  }

  async pause(): Promise<void> {
    await this.audioPlayer.pause();
  }

  async resume(): Promise<void> {
    await this.audioPlayer.resume();
  }

  disconnect(): void {
    if (!this.socket) {
      this.setStatus("closed");
      return;
    }

    this.socket.close();
    this.socket = null;
    this.connectPromise = null;
  }

  async dispose(): Promise<void> {
    this.disconnect();
    await this.audioPlayer.dispose();
    this.setStatus("idle");
  }

  private async ensureConnected(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    if (this.connectPromise) {
      await this.connectPromise;
      return;
    }

    this.setStatus("connecting");

    this.connectPromise = new Promise<void>((resolve, reject) => {
      const WebSocketCtor = WebSocket as unknown as RNWebSocketCtor;
      const headers = this.authorization ? { Authorization: this.authorization } : undefined;
      const baseDiagnostics = {
        ...sanitizeWsUrlForDiagnostics(this.wsUrl),
        hasAuthorizationHeader: Boolean(this.authorization),
        fileFormat: this.fileFormat,
      };

      console.log("[ws-audio] connecting", baseDiagnostics);
      const socket = new WebSocketCtor(this.wsUrl, undefined, { headers });

      let settled = false;
      this.socket = socket;

      socket.onopen = () => {
        console.log("[ws-audio] socket open", baseDiagnostics);
        Sentry.addBreadcrumb({
          category: "websocket_audio",
          message: "socket_open",
          level: "info",
          data: baseDiagnostics,
        });
        settled = true;
        this.setStatus("open");
        resolve();
      };

      socket.onmessage = (event) => {
        if (typeof event.data === "string") {
          console.log(`[ws-audio] message received (${event.data.length} chars)`);
        }
        void this.handleMessage(event.data);
      };

      socket.onerror = (event) => {
        const diagnostics = {
          ...baseDiagnostics,
          ...getWebSocketEventDiagnostics(event),
        };
        const error = makeWebSocketError("WebSocket connection failed", diagnostics, event);

        this.setStatus("error");
        captureWebSocketFailure(error, diagnostics);
        this.onError?.(error);
        if (!settled) {
          settled = true;
          reject(error);
        }
      };

      socket.onclose = (event) => {
        const diagnostics = {
          ...baseDiagnostics,
          ...getWebSocketEventDiagnostics(event),
        };

        console.log("[ws-audio] socket closed", diagnostics);
        this.socket = null;
        this.connectPromise = null;
        void this.audioPlayer.completeStream();
        this.setStatus("closed");
        if (!settled) {
          const error = makeWebSocketError("WebSocket closed before opening", diagnostics, event);

          captureWebSocketFailure(error, diagnostics);
          settled = true;
          reject(error);
        }
      };
    });

    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  private async handleMessage(rawData: unknown): Promise<void> {
    if (typeof rawData !== "string") return;

    try {
      const msg = JSON.parse(rawData);
      if (msg?.event === "task_continue" && typeof msg.audio === "string") {
        console.log(`[ws-audio] audio chunk received (${msg.audio.length} hex chars)`);
        if (this.logRawData) {
          console.log("[ws-audio] raw pcm data", msg.audio);
        }
        await this.audioPlayer.playHexChunk(msg.audio);
      }
    } catch (error) {
      this.onError?.(error);
    }
  }

  private normalizePayload(input: PlayAudioInput): Record<string, unknown> {
    if (typeof input === "string") {
      const text = input.trim();
      if (!text) throw new Error("playAudio requires non-empty text");
      return { text, file_format: this.fileFormat };
    }

    const text = String(input.text ?? "").trim();
    if (!text) throw new Error("playAudio requires non-empty text");
    return { ...input, text, file_format: this.fileFormat };
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.onStatusChange?.(status);
  }
}
