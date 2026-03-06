import { TEXT_TO_AUDIO_URL } from "@/constant";
import { HexPcmAudioPlayer, PlaybackStatus } from "@/services/hexPcmAudioPlayer";
import { SECRET_TOKEN } from "@/constant";
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
  audioPlayer?: HexPcmAudioPlayer;
  onStatusChange?: (status: ConnectionStatus) => void;
  onPlaybackStatusChange?: (status: PlaybackStatus) => void;
  onError?: (error: unknown) => void;
};

export class WebsocketHexPcmAudioService {
  private readonly wsUrl: string;
  private readonly authorization?: string;
  private readonly fileFormat: string;
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
      const socket = new WebSocketCtor(this.wsUrl, undefined, { headers });

      let settled = false;
      this.socket = socket;

      socket.onopen = () => {
        console.log("[ws-audio] socket open");
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
        this.setStatus("error");
        this.onError?.(event);
        if (!settled) {
          settled = true;
          reject(new Error("WebSocket connection failed"));
        }
      };

      socket.onclose = () => {
        console.log("[ws-audio] socket closed");
        this.socket = null;
        this.connectPromise = null;
        void this.audioPlayer.completeStream();
        this.setStatus("closed");
        if (!settled) {
          settled = true;
          reject(new Error("WebSocket closed before opening"));
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
