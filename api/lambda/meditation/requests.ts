import { useFetch } from "@/api/useFetch";
import { LAMBDA_SERVICE_URL } from "@/constant";
import { LambdaRequest } from "@/api/types";
import {
  AddRecentlyAccessedCourseInput,
  AddRecentlyAccessedCourseResult,
  GetMeditationAudioInput,
  GetMeditationAudioUrlResult,
  GetMeditationCourseDetailsInput,
  GetMeditationCourseDetailsResult,
  GetMeditationCoursesResult,
  GetRecommendedMeditationCoursesResult,
} from "@/api/lambda/meditation/types";

export const useMeditationApi = () => {
  const { commonFetch } = useFetch<
    | GetMeditationCoursesResult
    | GetRecommendedMeditationCoursesResult
    | GetMeditationCourseDetailsResult
    | GetMeditationAudioUrlResult
    | AddRecentlyAccessedCourseResult
  >({
    url: LAMBDA_SERVICE_URL,
    method: "POST",
    clearUserInfoFromCacheIfUnauthorized: false,
    useAuthFromCache: true,
  });

  const getMeditationCourses = () => {
    const lambdaConfig: LambdaRequest = {
      route: "get_all_courses",
    };

    return commonFetch({
      input: {
        ...lambdaConfig,
      },
    }) as Promise<GetMeditationCoursesResult>;
  };

  const getMeditationAudioUrl = (input: GetMeditationAudioInput) => {
    const lambdaConfig: LambdaRequest = {
      route: "get_audio_url",
    };

    return commonFetch({
      input: {
        ...lambdaConfig,
        ...input,
      },
    }) as Promise<GetMeditationAudioUrlResult>;
  };

  const getMeditationCourseDetails = (input: GetMeditationCourseDetailsInput) => {
    const lambdaConfig: LambdaRequest = {
      route: "get_meditation_course_details",
    };

    return commonFetch({
      input: {
        ...lambdaConfig,
        ...input,
      },
    }) as Promise<GetMeditationCourseDetailsResult>;
  };

  const getRecommendedMeditationCourses = () => {
    const lambdaConfig: LambdaRequest = {
      route: "get_recommended_courses",
    };

    return commonFetch({
      input: {
        ...lambdaConfig,
      },
    }) as Promise<GetRecommendedMeditationCoursesResult>;
  };

  const addRecentlyAccessedCourse = (input: AddRecentlyAccessedCourseInput) => {
    const lambdaConfig: LambdaRequest = {
      route: "add_recently_accessed_course",
    };

    return commonFetch({
      input: {
        ...lambdaConfig,
        ...input,
      },
    }) as Promise<AddRecentlyAccessedCourseResult>;
  };

  return {
    getMeditationCourses,
    getRecommendedMeditationCourses,
    getMeditationCourseDetails,
    getMeditationAudioUrl,
    addRecentlyAccessedCourse,
  };
};
