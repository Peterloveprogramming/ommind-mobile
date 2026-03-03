import { AudioContext } from "react-native-audio-api";

type BufferQueueSource = {
  connect: (destination: unknown) => void;
  enqueueBuffer: (buffer: unknown) => void;
  start: () => void;
  pause?: () => void;
  stop?: () => void;
};

export type PlaybackStatus = "idle" | "buffering" | "playing" | "paused" | "ended";

type HexPcmAudioPlayerOptions = {
  inputSampleRate?: number;
  warmupChunks?: number;
  onPlaybackStatusChange?: (status: PlaybackStatus) => void;
};

export class HexPcmAudioPlayer {
  private readonly inputSampleRate: number;
  private readonly warmupChunks: number;
  private readonly onPlaybackStatusChange?: (status: PlaybackStatus) => void;

  private audioCtx: AudioContext | null = null;
  private queue: BufferQueueSource | null = null;
  private started = false;
  private warmupCount = 0;
  private playbackStatus: PlaybackStatus = "idle";
  private queuedDurationMs = 0;
  private playbackStartedAtMs: number | null = null;
  private playbackEndTimer: ReturnType<typeof setTimeout> | null = null;
  private streamCompleted = false;
  private pausedAtMs: number | null = null;

  constructor(options: HexPcmAudioPlayerOptions = {}) {
    this.inputSampleRate = options.inputSampleRate ?? 32000;
    this.warmupChunks = options.warmupChunks ?? 3;
    this.onPlaybackStatusChange = options.onPlaybackStatusChange;
  }

  async beginStream(): Promise<void> {
    await this.resetAudioEngine();
    this.streamCompleted = false;
    this.queuedDurationMs = 0;
    this.playbackStartedAtMs = null;
    this.pausedAtMs = null;
    this.setPlaybackStatus("buffering");
  }

  async completeStream(): Promise<void> {
    this.streamCompleted = true;
    await this.startPlaybackIfReady();
    this.schedulePlaybackEnd();
  }

  async playHexChunk(hex: string): Promise<void> {
    if (!hex || hex.length < 4) return;
    if (hex.length % 2 !== 0) return;

    await this.ensureAudioEngine();

    const audioCtx = this.audioCtx;
    const queue = this.queue;
    if (!audioCtx || !queue) return;

    const bytes = this.hexToUint8Array(hex);
    if (bytes.length < 2) return;

    const floatsIn = this.pcm16leBytesToFloat32(bytes);
    const floatsOut = this.resampleLinear(floatsIn, this.inputSampleRate, audioCtx.sampleRate);

    const audioBuffer = audioCtx.createBuffer(1, floatsOut.length, audioCtx.sampleRate);
    audioBuffer.copyToChannel(floatsOut, 0);
    queue.enqueueBuffer(audioBuffer);
    this.queuedDurationMs += audioBuffer.duration * 1000;

    if (!this.started) {
      this.warmupCount += 1;
      await this.startPlaybackIfReady();
    } else if (!this.isPaused()) {
      this.setPlaybackStatus("playing");
    }

    if (this.streamCompleted) {
      this.schedulePlaybackEnd();
    }
  }

  async pause(): Promise<void> {
    if (this.isPaused() || this.playbackStatus === "idle" || this.playbackStatus === "ended") {
      return;
    }

    this.clearPlaybackEndTimer();
    this.pausedAtMs = Date.now();

    if (this.audioCtx?.state === "running") {
      await this.audioCtx.suspend();
    }

    this.setPlaybackStatus("paused");
  }

  async resume(): Promise<void> {
    if (!this.isPaused()) {
      return;
    }

    const pausedDurationMs = this.pausedAtMs ? Date.now() - this.pausedAtMs : 0;
    this.pausedAtMs = null;

    if (!this.audioCtx) {
      this.setPlaybackStatus("buffering");
      return;
    }

    if (this.started) {
      if (this.audioCtx.state !== "running") {
        await this.audioCtx.resume();
      }

      if (this.playbackStartedAtMs !== null) {
        this.playbackStartedAtMs += pausedDurationMs;
      }

      this.setPlaybackStatus("playing");
      this.schedulePlaybackEnd();
      return;
    }

    await this.startPlaybackIfReady();

    if (!this.started) {
      this.setPlaybackStatus("buffering");
      return;
    }

    this.schedulePlaybackEnd();
  }

  async dispose(): Promise<void> {
    await this.resetAudioEngine();
    this.streamCompleted = false;
    this.queuedDurationMs = 0;
    this.playbackStartedAtMs = null;
    this.pausedAtMs = null;
    this.setPlaybackStatus("idle");
  }

  private async ensureAudioEngine(): Promise<void> {
    if (this.audioCtx && this.queue) return;

    const audioCtx = new AudioContext();
    const queue = audioCtx.createBufferQueueSource() as unknown as BufferQueueSource;
    queue.connect(audioCtx.destination);

    this.audioCtx = audioCtx;
    this.queue = queue;
    this.started = false;
    this.warmupCount = 0;
  }

  private async resetAudioEngine(): Promise<void> {
    this.clearPlaybackEndTimer();

    try {
      this.queue?.stop?.();
    } catch {}

    try {
      await this.audioCtx?.close?.();
    } catch {}

    this.queue = null;
    this.audioCtx = null;
    this.started = false;
    this.warmupCount = 0;
  }

  private async startPlaybackIfReady(): Promise<void> {
    if (this.started || this.isPaused() || this.queuedDurationMs <= 0) {
      return;
    }

    const audioCtx = this.audioCtx;
    const queue = this.queue;
    if (!audioCtx || !queue) return;

    const hasEnoughBufferedAudio = this.warmupCount >= this.warmupChunks;
    if (!hasEnoughBufferedAudio && !this.streamCompleted) {
      return;
    }

    if (audioCtx.state !== "running") {
      await audioCtx.resume();
    }

    queue.start();
    this.started = true;
    this.playbackStartedAtMs = Date.now();
    this.setPlaybackStatus("playing");
  }

  private schedulePlaybackEnd(): void {
    if (!this.streamCompleted || this.isPaused()) return;

    this.clearPlaybackEndTimer();
    const remainingMs = this.getRemainingPlaybackMs();

    if (remainingMs <= 0) {
      this.queuedDurationMs = 0;
      this.playbackStartedAtMs = null;
      this.setPlaybackStatus("ended");
      return;
    }

    this.playbackEndTimer = setTimeout(() => {
      this.playbackEndTimer = null;
      this.queuedDurationMs = 0;
      this.playbackStartedAtMs = null;
      this.setPlaybackStatus("ended");
    }, remainingMs + 50);
  }

  private getRemainingPlaybackMs(): number {
    if (!this.started || this.playbackStartedAtMs === null) {
      return this.queuedDurationMs;
    }

    const elapsedMs = (this.pausedAtMs ?? Date.now()) - this.playbackStartedAtMs;
    return Math.max(0, this.queuedDurationMs - elapsedMs);
  }

  private clearPlaybackEndTimer(): void {
    if (!this.playbackEndTimer) return;
    clearTimeout(this.playbackEndTimer);
    this.playbackEndTimer = null;
  }

  private setPlaybackStatus(status: PlaybackStatus): void {
    if (this.playbackStatus === status) return;
    this.playbackStatus = status;
    this.onPlaybackStatusChange?.(status);
  }

  private isPaused(): boolean {
    return this.pausedAtMs !== null;
  }

  private resampleLinear(input: Float32Array, inRate: number, outRate: number): Float32Array {
    if (inRate === outRate) return input;

    const ratio = outRate / inRate;
    const outLength = Math.max(1, Math.floor(input.length * ratio));
    const output = new Float32Array(outLength);

    for (let i = 0; i < outLength; i += 1) {
      const src = i / ratio;
      const i0 = Math.floor(src);
      const i1 = Math.min(i0 + 1, input.length - 1);
      const frac = src - i0;
      output[i] = input[i0] * (1 - frac) + input[i1] * frac;
    }

    return output;
  }

  private hexToUint8Array(hex: string): Uint8Array {
    const clean = hex.trim();
    if (clean.length % 2 !== 0) throw new Error("Invalid hex length");

    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
      bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
    }

    return bytes;
  }

  private pcm16leBytesToFloat32(bytes: Uint8Array): Float32Array {
    if (bytes.length % 2 !== 0) throw new Error("PCM16 requires even length");

    const sampleCount = bytes.length / 2;
    const floats = new Float32Array(sampleCount);

    for (let i = 0; i < sampleCount; i += 1) {
      const lo = bytes[i * 2];
      const hi = bytes[i * 2 + 1];

      let sample = (hi << 8) | lo;
      if (sample & 0x8000) sample -= 0x10000;
      floats[i] = sample / 32768;
    }

    return floats;
  }
}
