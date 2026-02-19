/**
 * Minimal concept file:
 * - enqueue PCM chunks from websocket
 * - dequeue chunks in a playback loop
 * - drain and stop cleanly
 *
 * This uses a mock sink for learning. Replace `MockAudioSink` with a real native PCM sink.
 */

export type PcmChunk = Int16Array;

interface AudioSink {
  write(chunk: PcmChunk): Promise<void>;
  close(): Promise<void>;
}

class MockAudioSink implements AudioSink {
  async write(chunk: PcmChunk): Promise<void> {
    // Pretend this chunk is played by native audio engine.
    console.log(`[sink] played ${chunk.length} samples`);
  }

  async close(): Promise<void> {
    console.log("[sink] closed");
  }
}

export class MinimalPcmQueuePlayer {
  private queue: PcmChunk[] = [];
  private isPlaying = false;
  private isEnding = false;
  private readonly sink: AudioSink;

  constructor(sink: AudioSink = new MockAudioSink()) {
    this.sink = sink;
  }

  enqueue(chunk: PcmChunk): void {
    this.queue.push(chunk);
  }

  async start(): Promise<void> {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.isEnding = false;

    while (this.isPlaying) {
      const chunk = this.queue.shift();

      if (!chunk) {
        if (this.isEnding) break;
        await sleep(10); // wait for producer (websocket) to enqueue more
        continue;
      }

      await this.sink.write(chunk);
    }

    await this.sink.close();
    this.isPlaying = false;
  }

  stopAfterDrain(): void {
    this.isEnding = true;
  }

  stopNow(): void {
    this.queue = [];
    this.isEnding = true;
    this.isPlaying = false;
  }

  get bufferedChunks(): number {
    return this.queue.length;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Example usage with websocket:
// const player = new MinimalPcmQueuePlayer();
// player.start();
//
// ws.onmessage = (event) => {
//   // Assume event.data is PCM16 bytes in ArrayBuffer for this example.
//   const bytes = new Uint8Array(event.data as ArrayBuffer);
//   const samples = new Int16Array(bytes.buffer);
//   player.enqueue(samples);
// };
//
// ws.onclose = () => {
//   player.stopAfterDrain();
// };
