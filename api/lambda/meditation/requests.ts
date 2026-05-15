import { useFetch } from "@/api/useFetch";
import { LAMBDA_SERVICE_URL } from "@/constant";
import { LambdaRequest } from "@/api/types";
import {
  GetMeditationAudioInput,
  GetMeditationAudioUrlResult,
  GetHomePageTextResult,
  GetMeditationCourseDetailsInput,
  GetMeditationCourseDetailsResult,
  GetMeditationCoursesResult,
  GetRecommendedMeditationCoursesResult,
} from "@/api/lambda/meditation/types";

export const useMeditationApi = () => {
  const { commonFetch } = useFetch<
    | GetMeditationCoursesResult
    | GetRecommendedMeditationCoursesResult
    | GetHomePageTextResult
    | GetMeditationCourseDetailsResult
    | GetMeditationAudioUrlResult
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

  const getHomePageText = () => {
    const lambdaConfig: LambdaRequest = {
      route: "get_home_page_text",
    };

    return commonFetch({
      input: {
        ...lambdaConfig,
      },
    }) as Promise<GetHomePageTextResult>;
  };

  return {
    getMeditationCourses,
    getRecommendedMeditationCourses,
    getHomePageText,
    getMeditationCourseDetails,
    getMeditationAudioUrl,
  };
};
