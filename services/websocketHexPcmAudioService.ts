import { WS_URL } from "@/constant";
import { HexPcmAudioPlayer } from "@/services/hexPcmAudioPlayer";

type ConnectionStatus = "idle" | "connecting" | "open" | "closed" | "error";
type RNWebSocketCtor = new (
  url: string,
  protocols?: string | string[] | null,
  options?: { headers?: Record<string, string> }
) => WebSocket;

type PlayAudioInput = string | ({ text: string } & Record<string, unknown>);

type WebsocketHexPcmAudioServiceOptions = {
  wsUrl?: string;
  authorization?: string;
  fileFormat?: string;
  audioPlayer?: HexPcmAudioPlayer;
  onStatusChange?: (status: ConnectionStatus) => void;
  onError?: (error: unknown) => void;
};

export class WebsocketHexPcmAudioService {
  private readonly wsUrl: string;
  private readonly authorization?: string;
  private readonly fileFormat: string;
  private readonly onStatusChange?: (status: ConnectionStatus) => void;
  private readonly onError?: (error: unknown) => void;

  private readonly audioPlayer: HexPcmAudioPlayer;

  private socket: WebSocket | null = null;
  private connectPromise: Promise<void> | null = null;
  private status: ConnectionStatus = "idle";

  constructor(options: WebsocketHexPcmAudioServiceOptions = {}) {
    this.wsUrl = options.wsUrl ?? WS_URL;
    this.authorization = options.authorization ?? "Ommind2026";
    this.fileFormat = options.fileFormat ?? "pcm";
    this.audioPlayer = options.audioPlayer ?? new HexPcmAudioPlayer();
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
    await this.ensureConnected();
    this.socket?.send(JSON.stringify(payload));
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
        settled = true;
        this.setStatus("open");
        resolve();
      };

      socket.onmessage = (event) => {
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
        this.socket = null;
        this.connectPromise = null;
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
