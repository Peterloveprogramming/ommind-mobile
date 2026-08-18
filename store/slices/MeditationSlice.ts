import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type {
  MeditationCourse,
  MeditationCourseSession,
  MeditationCoursesByType,
} from "@/api/meditation/types";
import type { RootState } from "@/store";

export const MEDITATION_CACHE_TTL_MS = 10 * 60 * 1000;

export const isMeditationCacheFresh = (lastFetchedAt: number | null): boolean => {
  return lastFetchedAt !== null && Date.now() - lastFetchedAt < MEDITATION_CACHE_TTL_MS;
};

type CachedCourseDetails = {
  course: MeditationCourse;
  lastFetchedAt: number;
};

export type MeditationState = {
  coursesByType: MeditationCoursesByType | null;
  coursesByTypeLastFetchedAt: number | null;
  courseDetailsByUuid: Record<string, CachedCourseDetails>;
};

const initialState: MeditationState = {
  coursesByType: null,
  coursesByTypeLastFetchedAt: null,
  courseDetailsByUuid: {},
};

const meditationSlice = createSlice({
  name: "meditation",
  initialState,
  reducers: {
    setMeditationCourses: (state, action: PayloadAction<MeditationCoursesByType>) => {
      state.coursesByType = action.payload;
      state.coursesByTypeLastFetchedAt = Date.now();
    },
    setMeditationCourseDetails: (
      state,
      action: PayloadAction<{ uuid: string; course: MeditationCourse }>
    ) => {
      state.courseDetailsByUuid[action.payload.uuid] = {
        course: action.payload.course,
        lastFetchedAt: Date.now(),
      };
    },
    invalidateMeditationCourseDetails: (state, action: PayloadAction<{ uuid: string }>) => {
      delete state.courseDetailsByUuid[action.payload.uuid];
    },
    patchMeditationCourseSession: (
      state,
      action: PayloadAction<{
        uuid: string;
        sessionNumber: number;
        changes: Partial<Pick<MeditationCourseSession, "progress" | "session_completed" | "favourite">>;
      }>
    ) => {
      const cached = state.courseDetailsByUuid[action.payload.uuid];
      const session = cached?.course.sessions.find(
        (candidate) => candidate.session_number === action.payload.sessionNumber
      );

      if (!session) {
        return;
      }

      Object.assign(session, action.payload.changes);
    },
    clearMeditationCache: () => initialState,
  },
});

export const getMeditationCoursesByType = (state: RootState) => state.meditation.coursesByType;

export const getMeditationCoursesByTypeLastFetchedAt = (state: RootState) =>
  state.meditation.coursesByTypeLastFetchedAt;

export const getMeditationCourseDetailsCache =
  (uuid: string | undefined) =>
  (state: RootState): CachedCourseDetails | undefined =>
    uuid ? state.meditation.courseDetailsByUuid[uuid] : undefined;

export const getMeditationCourseDetailsByUuidMap = (state: RootState) =>
  state.meditation.courseDetailsByUuid;

export const {
  setMeditationCourses,
  setMeditationCourseDetails,
  invalidateMeditationCourseDetails,
  patchMeditationCourseSession,
  clearMeditationCache,
} = meditationSlice.actions;

export default meditationSlice.reducer;
