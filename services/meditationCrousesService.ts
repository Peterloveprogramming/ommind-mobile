import { GetMeditationCoursesResult } from "@/api/lambda/useMeditationCrouses/requests";

export type MeditationCrousesStatus = "idle" | "loading" | "success" | "error";

export type MeditationCrousesServiceOptions = {
  onStatusChange?: (status: MeditationCrousesStatus) => void;
  onResult?: (result: GetMeditationCoursesResult) => void;
  onError?: (error: unknown) => void;
};

type GetMeditationCoursesRequest = () => Promise<GetMeditationCoursesResult>;

export class MeditationCrousesService {
  private status: MeditationCrousesStatus = "idle";
  private lastResult: GetMeditationCoursesResult | null = null;
  private lastError: unknown = null;

  private readonly request: GetMeditationCoursesRequest;
  private readonly onStatusChange?: (status: MeditationCrousesStatus) => void;
  private readonly onResult?: (result: GetMeditationCoursesResult) => void;
  private readonly onError?: (error: unknown) => void;

  constructor(
    request: GetMeditationCoursesRequest,
    options: MeditationCrousesServiceOptions = {}
  ) {
    this.request = request;
    this.onStatusChange = options.onStatusChange;
    this.onResult = options.onResult;
    this.onError = options.onError;
  }

  get coursesStatus(): MeditationCrousesStatus {
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

  private setStatus(status: MeditationCrousesStatus): void {
    this.status = status;
    this.onStatusChange?.(status);
  }
}
