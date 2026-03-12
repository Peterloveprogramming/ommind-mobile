import { useFetch } from "@/api/useFetch";
import { LAMBDA_SERVICE_URL } from "@/constant";
import { LambdaRequest } from "@/api/types";
import {
  GetMeditationAudioInput,
  GetMeditationAudioUrlResult,
  GetMeditationCourseDetailsInput,
  GetMeditationCourseDetailsResult,
  GetMeditationCoursesResult,
} from "@/api/lambda/meditation/types";

export const useMeditationApi = () => {
  const { commonFetch } = useFetch<
    GetMeditationCoursesResult | GetMeditationCourseDetailsResult | GetMeditationAudioUrlResult
  >({
    url: LAMBDA_SERVICE_URL,
    method: "POST",
    clearUserInfoFromCacheIfUnauthorized: true,
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

  return {
    getMeditationCourses,
    getMeditationCourseDetails,
    getMeditationAudioUrl,
  };
};
