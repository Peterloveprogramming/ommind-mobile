import {
  GetMeditationAudioInput,
  GetMeditationAudioUrlResult,
} from "@/api/lambda/useMeditationAudioApi/requests";

export type MeditationAudioStatus = "idle" | "loading" | "success" | "error";

export type MeditationAudioServiceOptions = {
  onStatusChange?: (status: MeditationAudioStatus) => void;
  onResult?: (result: GetMeditationAudioUrlResult) => void;
  onError?: (error: unknown) => void;
};

type GetMeditationAudioUrlRequest = (input: GetMeditationAudioInput) => Promise<GetMeditationAudioUrlResult>;

export class MeditationAudioService {
  private status: MeditationAudioStatus = "idle";
  private lastResult: GetMeditationAudioUrlResult | null = null;
  private lastError: unknown = null;

  private readonly request: GetMeditationAudioUrlRequest;
  private readonly onStatusChange?: (status: MeditationAudioStatus) => void;
  private readonly onResult?: (result: GetMeditationAudioUrlResult) => void;
  private readonly onError?: (error: unknown) => void;

  constructor(
    request: GetMeditationAudioUrlRequest,
    options: MeditationAudioServiceOptions = {}
  ) {
    this.request = request;
    this.onStatusChange = options.onStatusChange;
    this.onResult = options.onResult;
    this.onError = options.onError;
  }

  get audioStatus(): MeditationAudioStatus {
    return this.status;
  }

  get result(): GetMeditationAudioUrlResult | null {
    return this.lastResult;
  }

  get error(): unknown {
    return this.lastError;
  }

  async getAudioUrl(input: GetMeditationAudioInput): Promise<GetMeditationAudioUrlResult> {
    this.lastError = null;
    this.setStatus("loading");

    try {
      const result = await this.request(input);
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

  private setStatus(status: MeditationAudioStatus): void {
    this.status = status;
    this.onStatusChange?.(status);
  }
}
