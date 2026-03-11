import { useMeditationCourses } from "@/services/meditation/useMeditationCourses";
import { MeditationCoursesServiceOptions } from "@/services/meditation/meditationService";

type UseMeditationCrousesServiceOptions = MeditationCoursesServiceOptions;

export function useMeditationCrousesService(options: UseMeditationCrousesServiceOptions = {}) {
  return useMeditationCourses(options);
}
