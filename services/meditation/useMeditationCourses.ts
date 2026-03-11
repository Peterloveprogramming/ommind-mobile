import { useCallback, useRef, useState } from "react";
import { useMeditationApi } from "@/api/lambda/meditation/requests";
import { GetMeditationCoursesResult } from "@/api/lambda/meditation/types";
import {
  MeditationCoursesService,
  MeditationCoursesServiceOptions,
  MeditationCoursesStatus,
} from "@/services/meditation/meditationService";

type UseMeditationCoursesOptions = MeditationCoursesServiceOptions;

export function useMeditationCourses(options: UseMeditationCoursesOptions = {}) {
  const [status, setStatus] = useState<MeditationCoursesStatus>("idle");
  const [result, setResult] = useState<GetMeditationCoursesResult | null>(null);
  const [error, setError] = useState<unknown>(null);
  const { getMeditationCourses } = useMeditationApi();

  const serviceRef = useRef<MeditationCoursesService | null>(null);

  if (!serviceRef.current) {
    serviceRef.current = new MeditationCoursesService(getMeditationCourses, {
      ...options,
      onStatusChange: (nextStatus) => {
        setStatus(nextStatus);
        options.onStatusChange?.(nextStatus);
      },
      onResult: (nextResult) => {
        setResult(nextResult);
        options.onResult?.(nextResult);
      },
      onError: (nextError) => {
        setError(nextError);
        options.onError?.(nextError);
      },
    });
  }

  const fetchMeditationCourses = useCallback(async () => {
    setError(null);
    return await serviceRef.current!.getAllCourses();
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    serviceRef.current?.reset();
  }, []);

  return {
    status,
    isLoading: status === "loading",
    result,
    error,
    fetchMeditationCourses,
    reset,
    service: serviceRef.current,
  };
}
