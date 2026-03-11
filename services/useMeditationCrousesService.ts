import { useCallback, useRef, useState } from "react";
import {
  GetMeditationCoursesResult,
  useGetMeditationCourses,
} from "@/api/lambda/useMeditationCrouses/requests";
import {
  MeditationCrousesService,
  MeditationCrousesServiceOptions,
  MeditationCrousesStatus,
} from "@/services/meditationCrousesService";

type UseMeditationCrousesServiceOptions = MeditationCrousesServiceOptions;

export function useMeditationCrousesService(options: UseMeditationCrousesServiceOptions = {}) {
  const [status, setStatus] = useState<MeditationCrousesStatus>("idle");
  const [result, setResult] = useState<GetMeditationCoursesResult | null>(null);
  const [error, setError] = useState<unknown>(null);
  const { getMeditationCourses } = useGetMeditationCourses();

  const serviceRef = useRef<MeditationCrousesService | null>(null);

  if (!serviceRef.current) {
    serviceRef.current = new MeditationCrousesService(getMeditationCourses, {
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
