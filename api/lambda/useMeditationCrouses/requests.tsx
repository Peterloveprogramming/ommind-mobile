import { useMeditationApi } from "@/api/lambda/meditation/requests";

export type {
  GetMeditationCoursesResult,
  MeditationCourse,
  MeditationCourseDescriptionSection,
  MeditationCoursesByType,
  MeditationCourseSession,
} from "@/api/lambda/meditation/types";

export const useGetMeditationCourses = () => {
  const { getMeditationCourses } = useMeditationApi();
  return { getMeditationCourses };
};
