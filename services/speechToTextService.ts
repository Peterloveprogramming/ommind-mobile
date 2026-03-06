import {
  convertAudioFileToTextRequest,
  SpeechToTextAudioFile,
  SpeechToTextResponse,
} from "@/api/useSpeechToTextService/requests";

export type SpeechToTextStatus = "idle" | "converting" | "success" | "error";

export type SpeechToTextServiceOptions = {
  onStatusChange?: (status: SpeechToTextStatus) => void;
  onResult?: (result: SpeechToTextResponse) => void;
  onError?: (error: unknown) => void;
};

export class SpeechToTextService {
  private status: SpeechToTextStatus = "idle";
  private lastResult: SpeechToTextResponse | null = null;
  private lastError: unknown = null;

  private readonly onStatusChange?: (status: SpeechToTextStatus) => void;
  private readonly onResult?: (result: SpeechToTextResponse) => void;
  private readonly onError?: (error: unknown) => void;

  constructor(options: SpeechToTextServiceOptions = {}) {
    this.onStatusChange = options.onStatusChange;
    this.onResult = options.onResult;
    this.onError = options.onError;
  }

  get conversionStatus(): SpeechToTextStatus {
    return this.status;
  }

  get result(): SpeechToTextResponse | null {
    return this.lastResult;
  }

  get error(): unknown {
    return this.lastError;
  }

  async convertAudioToText(audioFile: SpeechToTextAudioFile): Promise<SpeechToTextResponse> {
    this.lastError = null;
    this.setStatus("converting");

    try {
      const result = await convertAudioFileToTextRequest(audioFile);
      this.lastResult = result;
      this.onResult?.(result);
      this.setStatus("success");
      return result;
    } catch (error) {
      this.lastError = error;
      this.setStatus("error");
      this.onError?.(error);
      throw error;
    }
  }

  reset(): void {
    this.lastResult = null;
    this.lastError = null;
    this.setStatus("idle");
  }

  private setStatus(status: SpeechToTextStatus): void {
    this.status = status;
    this.onStatusChange?.(status);
  }
}
