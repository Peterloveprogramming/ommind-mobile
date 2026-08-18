import { useCallback, useRef, useState } from "react";
import { useMeditationApi } from "@/api/meditation/requests";
import {
  GetMeditationCourseDetailsInput,
  GetRecommendedSessionResult,
} from "@/api/meditation/types";
import {
  MeditationCourseDetailsService,
  MeditationCourseDetailsStatus,
  MeditationCoursesService,
  MeditationCoursesServiceOptions,
  MeditationCoursesStatus,
} from "@/api/meditation/meditationService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getMeditationCourseDetailsByUuidMap,
  getMeditationCourseDetailsCache,
  getMeditationCoursesByType,
  getMeditationCoursesByTypeLastFetchedAt,
  isMeditationCacheFresh,
  setMeditationCourseDetails,
  setMeditationCourses,
} from "@/store/slices/MeditationSlice";

type UseMeditationCoursesOptions = MeditationCoursesServiceOptions & {
  courseDetailsUuid?: string;
  debugLabel?: string;
  enableDebugLogging?: boolean;
};

const logMeditationCacheDebug = (
  enabled: boolean,
  label: string,
  message: string,
  details?: Record<string, unknown>
) => {
  if (!enabled) {
    return;
  }

  console.log(`[${label}] ${message}`, details ?? "");
};

export function useMeditationCourses(options: UseMeditationCoursesOptions = {}) {
  const {
    courseDetailsUuid,
    debugLabel = "useMeditationCourses",
    enableDebugLogging = false,
    ...serviceOptions
  } = options;
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<MeditationCoursesStatus>("idle");
  const [error, setError] = useState<unknown>(null);
  const [detailsStatus, setDetailsStatus] = useState<MeditationCourseDetailsStatus>("idle");
  const [detailsError, setDetailsError] = useState<unknown>(null);
  const coursesByType = useAppSelector(getMeditationCoursesByType);
  const coursesByTypeLastFetchedAt = useAppSelector(getMeditationCoursesByTypeLastFetchedAt);
  const {
    getMeditationCourses,
    getRecommendedSession,
    getMeditationCourseDetails,
  } =
    useMeditationApi();

  const isDebugLoggingEnabled = enableDebugLogging && __DEV__;
  const [detailsUuid, setDetailsUuid] = useState<string | undefined>(courseDetailsUuid);
  const selectedDetailsUuid = courseDetailsUuid ?? detailsUuid;
  const courseDetailsCache = useAppSelector(getMeditationCourseDetailsCache(selectedDetailsUuid));
  const courseDetails = courseDetailsCache?.course ?? null;
  const courseDetailsByUuidMap = useAppSelector(getMeditationCourseDetailsByUuidMap);

  const serviceRef = useRef<MeditationCoursesService | null>(null);
  const detailsServiceRef = useRef<MeditationCourseDetailsService | null>(null);
  const recommendedRequestRef = useRef(getRecommendedSession);
  const dispatchRef = useRef(dispatch);
  const courseDetailsByUuidMapRef = useRef(courseDetailsByUuidMap);
  const selectedDetailsUuidRef = useRef(selectedDetailsUuid);
  const debugRef = useRef({
    enabled: isDebugLoggingEnabled,
    label: debugLabel,
  });

  recommendedRequestRef.current = getRecommendedSession;
  dispatchRef.current = dispatch;
  courseDetailsByUuidMapRef.current = courseDetailsByUuidMap;
  selectedDetailsUuidRef.current = selectedDetailsUuid;
  debugRef.current = {
    enabled: isDebugLoggingEnabled,
    label: debugLabel,
  };

  if (!serviceRef.current) {
    serviceRef.current = new MeditationCoursesService(getMeditationCourses, {
      ...serviceOptions,
      onStatusChange: (nextStatus) => {
        logMeditationCacheDebug(
          debugRef.current.enabled,
          debugRef.current.label,
          "courses status changed",
          { status: nextStatus }
        );
        setStatus(nextStatus);
        serviceOptions.onStatusChange?.(nextStatus);
      },
      onResult: (nextResult) => {
        if (nextResult.data?.courses) {
          dispatchRef.current(setMeditationCourses(nextResult.data.courses));
        }
        logMeditationCacheDebug(
          debugRef.current.enabled,
          debugRef.current.label,
          "courses fetched",
          {
            hasCourses: Boolean(nextResult.data?.courses),
            calmCount: nextResult.data?.courses?.calm.length ?? 0,
            awarenessCount: nextResult.data?.courses?.awareness.length ?? 0,
            insightCount: nextResult.data?.courses?.insight.length ?? 0,
          }
        );
        serviceOptions.onResult?.(nextResult);
      },
      onError: (nextError) => {
        logMeditationCacheDebug(
          debugRef.current.enabled,
          debugRef.current.label,
          "courses fetch failed",
          { error: nextError }
        );
        setError(nextError);
        serviceOptions.onError?.(nextError);
      },
    });
  }

  if (!detailsServiceRef.current) {
    detailsServiceRef.current = new MeditationCourseDetailsService(getMeditationCourseDetails, {
      onStatusChange: (nextStatus) => {
        logMeditationCacheDebug(
          debugRef.current.enabled,
          debugRef.current.label,
          "course details status changed",
          {
            uuid: selectedDetailsUuidRef.current,
            status: nextStatus,
          }
        );
        setDetailsStatus(nextStatus);
      },
      onResult: (nextResult) => {
        const course = nextResult.data?.course_details;
        if (course) {
          dispatchRef.current(setMeditationCourseDetails({ uuid: course.uuid, course }));
        }
        logMeditationCacheDebug(
          debugRef.current.enabled,
          debugRef.current.label,
          "course details fetched",
          {
            uuid: course?.uuid,
            title: course?.title,
            sessionCount: course?.sessions.length ?? 0,
          }
        );
      },
      onError: (nextError) => {
        logMeditationCacheDebug(
          debugRef.current.enabled,
          debugRef.current.label,
          "course details fetch failed",
          {
            uuid: selectedDetailsUuidRef.current,
            error: nextError,
          }
        );
        setDetailsError(nextError);
      },
    });
  }

  const fetchMeditationCourses = useCallback(async () => {
    if (coursesByType && isMeditationCacheFresh(coursesByTypeLastFetchedAt)) {
      logMeditationCacheDebug(isDebugLoggingEnabled, debugLabel, "courses cache hit", {
        cacheAgeMs: coursesByTypeLastFetchedAt == null ? null : Date.now() - coursesByTypeLastFetchedAt,
      });
      return;
    }

    logMeditationCacheDebug(isDebugLoggingEnabled, debugLabel, "courses cache miss; fetching", {
      hasCachedCourses: Boolean(coursesByType),
      cacheAgeMs: coursesByTypeLastFetchedAt == null ? null : Date.now() - coursesByTypeLastFetchedAt,
    });
    setError(null);
    await serviceRef.current!.getAllCourses();
  }, [coursesByType, coursesByTypeLastFetchedAt, debugLabel, isDebugLoggingEnabled]);

  const fetchRecommendedSession = useCallback(async () => {
    return (await recommendedRequestRef.current()) as GetRecommendedSessionResult;
  }, []);

  const fetchMeditationCourseDetails = useCallback(
    async (input: GetMeditationCourseDetailsInput) => {
      setDetailsUuid(input.uuid);

      const cached = courseDetailsByUuidMapRef.current[input.uuid];
      const cacheAgeMs = cached ? Date.now() - cached.lastFetchedAt : null;
      if (cached && isMeditationCacheFresh(cached.lastFetchedAt)) {
        logMeditationCacheDebug(isDebugLoggingEnabled, debugLabel, "course details cache hit", {
          uuid: input.uuid,
          type: input.type,
          cacheAgeMs,
          title: cached.course.title,
          sessionCount: cached.course.sessions.length,
        });
        return;
      }

      logMeditationCacheDebug(isDebugLoggingEnabled, debugLabel, "course details cache miss; fetching", {
        uuid: input.uuid,
        type: input.type,
        hasCachedCourse: Boolean(cached),
        cacheAgeMs,
        reason: cached ? "stale" : "empty",
      });
      setDetailsError(null);
      await detailsServiceRef.current!.getCourseDetails(input);
    },
    [debugLabel, isDebugLoggingEnabled]
  );

  const reset = useCallback(() => {
    setError(null);
    serviceRef.current?.reset();
    setDetailsUuid(undefined);
    setDetailsError(null);
    detailsServiceRef.current?.reset();
  }, []);

  return {
    status,
    isLoading: status === "loading",
    coursesByType,
    error,
    detailsStatus,
    isDetailsLoading: detailsStatus === "loading",
    courseDetails,
    detailsError,
    fetchMeditationCourses,
    fetchRecommendedSession,
    fetchMeditationCourseDetails,
    reset,
    service: serviceRef.current,
    detailsService: detailsServiceRef.current,
  };
}
