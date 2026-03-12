import { useMeditationApi } from "@/api/lambda/meditation/requests";

export type {
  GetMeditationCourseDetailsInput,
  GetMeditationCourseDetailsResult,
  GetMeditationCoursesResult,
  MeditationCourse,
  MeditationCourseDescriptionSection,
  MeditationCoursesByType,
  MeditationCourseSession,
} from "@/api/lambda/meditation/types";

export const useGetMeditationCourses = () => {
  const { getMeditationCourses, getMeditationCourseDetails } = useMeditationApi();
  return { getMeditationCourses, getMeditationCourseDetails };
};
