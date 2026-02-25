import { AudioContext } from "react-native-audio-api";

type BufferQueueSource = {
  connect: (destination: unknown) => void;
  enqueueBuffer: (buffer: unknown) => void;
  start: () => void;
  stop?: () => void;
};

type HexPcmAudioPlayerOptions = {
  inputSampleRate?: number;
  warmupChunks?: number;
};

export class HexPcmAudioPlayer {
  private readonly inputSampleRate: number;
  private readonly warmupChunks: number;

  private audioCtx: AudioContext | null = null;
  private queue: BufferQueueSource | null = null;
  private started = false;
  private warmupCount = 0;

  constructor(options: HexPcmAudioPlayerOptions = {}) {
    this.inputSampleRate = options.inputSampleRate ?? 32000;
    this.warmupChunks = options.warmupChunks ?? 3;
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

    if (!this.started) {
      this.warmupCount += 1;
      if (this.warmupCount >= this.warmupChunks) {
        if (audioCtx.state !== "running") await audioCtx.resume();
        queue.start();
        this.started = true;
      }
    }
  }

  async dispose(): Promise<void> {
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
