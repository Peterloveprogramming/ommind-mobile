import { useCallback, useRef, useState } from "react";
import { useMeditationApi } from "@/api/lambda/meditation/requests";
import {
  GetMeditationCourseDetailsInput,
  GetMeditationCourseDetailsResult,
  GetMeditationCoursesResult,
} from "@/api/lambda/meditation/types";
import {
  MeditationCourseDetailsService,
  MeditationCourseDetailsStatus,
  MeditationCoursesService,
  MeditationCoursesServiceOptions,
  MeditationCoursesStatus,
} from "@/services/meditation/meditationService";

type UseMeditationCoursesOptions = MeditationCoursesServiceOptions;

export function useMeditationCourses(options: UseMeditationCoursesOptions = {}) {
  const [status, setStatus] = useState<MeditationCoursesStatus>("idle");
  const [result, setResult] = useState<GetMeditationCoursesResult | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [detailsStatus, setDetailsStatus] = useState<MeditationCourseDetailsStatus>("idle");
  const [detailsResult, setDetailsResult] = useState<GetMeditationCourseDetailsResult | null>(null);
  const [detailsError, setDetailsError] = useState<unknown>(null);
  const { getMeditationCourses, getMeditationCourseDetails } = useMeditationApi();

  const serviceRef = useRef<MeditationCoursesService | null>(null);
  const detailsServiceRef = useRef<MeditationCourseDetailsService | null>(null);

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

  if (!detailsServiceRef.current) {
    detailsServiceRef.current = new MeditationCourseDetailsService(getMeditationCourseDetails, {
      onStatusChange: (nextStatus) => {
        setDetailsStatus(nextStatus);
      },
      onResult: (nextResult) => {
        setDetailsResult(nextResult);
      },
      onError: (nextError) => {
        setDetailsError(nextError);
      },
    });
  }

  const fetchMeditationCourses = useCallback(async () => {
    setError(null);
    return await serviceRef.current!.getAllCourses();
  }, []);

  const fetchMeditationCourseDetails = useCallback(
    async (input: GetMeditationCourseDetailsInput) => {
      setDetailsError(null);
      return await detailsServiceRef.current!.getCourseDetails(input);
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    serviceRef.current?.reset();
    setDetailsResult(null);
    setDetailsError(null);
    detailsServiceRef.current?.reset();
  }, []);

  return {
    status,
    isLoading: status === "loading",
    result,
    error,
    detailsStatus,
    isDetailsLoading: detailsStatus === "loading",
    detailsResult,
    detailsError,
    fetchMeditationCourses,
    fetchMeditationCourseDetails,
    reset,
    service: serviceRef.current,
    detailsService: detailsServiceRef.current,
  };
}
