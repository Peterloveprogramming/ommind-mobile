import {
  GetMeditationAudioInput,
  GetMeditationAudioUrlResult,
  GetMeditationCoursesResult,
} from "@/api/lambda/meditation/types";

export type MeditationAudioStatus = "idle" | "loading" | "success" | "error";
export type MeditationCoursesStatus = "idle" | "loading" | "success" | "error";

export type MeditationAudioServiceOptions = {
  onStatusChange?: (status: MeditationAudioStatus) => void;
  onResult?: (result: GetMeditationAudioUrlResult) => void;
  onError?: (error: unknown) => void;
};

export type MeditationCoursesServiceOptions = {
  onStatusChange?: (status: MeditationCoursesStatus) => void;
  onResult?: (result: GetMeditationCoursesResult) => void;
  onError?: (error: unknown) => void;
};

type GetMeditationAudioUrlRequest = (
  input: GetMeditationAudioInput
) => Promise<GetMeditationAudioUrlResult>;
type GetMeditationCoursesRequest = () => Promise<GetMeditationCoursesResult>;

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

export class MeditationCoursesService {
  private status: MeditationCoursesStatus = "idle";
  private lastResult: GetMeditationCoursesResult | null = null;
  private lastError: unknown = null;

  private readonly request: GetMeditationCoursesRequest;
  private readonly onStatusChange?: (status: MeditationCoursesStatus) => void;
  private readonly onResult?: (result: GetMeditationCoursesResult) => void;
  private readonly onError?: (error: unknown) => void;

  constructor(
    request: GetMeditationCoursesRequest,
    options: MeditationCoursesServiceOptions = {}
  ) {
    this.request = request;
    this.onStatusChange = options.onStatusChange;
    this.onResult = options.onResult;
    this.onError = options.onError;
  }

  get coursesStatus(): MeditationCoursesStatus {
    return this.status;
  }

  get result(): GetMeditationCoursesResult | null {
    return this.lastResult;
  }

  get error(): unknown {
    return this.lastError;
  }

  async getAllCourses(): Promise<GetMeditationCoursesResult> {
    this.lastError = null;
    this.setStatus("loading");

    try {
      const result = await this.request();
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

  private setStatus(status: MeditationCoursesStatus): void {
    this.status = status;
    this.onStatusChange?.(status);
  }
}
