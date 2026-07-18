import { useFetch } from "@/api/useFetch";
import { LAMBDA_SERVICE_URL } from "@/constant";
import { LambdaRequest } from "@/api/types";
import {
  AddMoodCheckInInput,
  AddMoodCheckInResult,
  GetMeditationAudioInput,
  GetMeditationAudioUrlResult,
  GetHomepageInfoInput,
  GetHomepageInfoResult,
  GetHomePageTextResult,
  GetIntentionAndAffirmationResult,
  GetMeditationCourseDetailsInput,
  GetMeditationCourseDetailsResult,
  GetMeditationCoursesResult,
  GetRecommendedSessionResult,
  ResetDailyMoodResult,
} from "./types";

export const useMeditationApi = () => {
  const { commonFetch } = useFetch<
    | GetMeditationCoursesResult
    | GetRecommendedSessionResult
    | GetHomepageInfoResult
    | GetHomePageTextResult
    | GetIntentionAndAffirmationResult
    | AddMoodCheckInResult
    | ResetDailyMoodResult
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

  const getRecommendedSession = () => {
    const lambdaConfig: LambdaRequest = {
      route: "get_recommended_session",
    };

    return commonFetch({
      input: {
        ...lambdaConfig,
      },
    }) as Promise<GetRecommendedSessionResult>;
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

  const getHomepageInfo = (input: GetHomepageInfoInput = {}) => {
    const lambdaConfig: LambdaRequest = {
      route: "get_homepage_info",
    };

    return commonFetch({
      input: {
        ...lambdaConfig,
        ...input,
      },
    }) as Promise<GetHomepageInfoResult>;
  };

  const getIntentionAndAffirmation = () => {
    const lambdaConfig: LambdaRequest = {
      route: "get_intention_and_affirmation",
    };

    return commonFetch({
      input: {
        ...lambdaConfig,
      },
    }) as Promise<GetIntentionAndAffirmationResult>;
  };

  const addMoodCheckIn = (input: AddMoodCheckInInput) => {
    const lambdaConfig: LambdaRequest = {
      route: "add_mood_check_in",
    };

    return commonFetch({
      input: {
        ...lambdaConfig,
        ...input,
      },
    }) as Promise<AddMoodCheckInResult>;
  };

  const resetDailyMood = () => {
    const lambdaConfig: LambdaRequest = {
      route: "reset_daily_mood",
    };

    return commonFetch({
      input: {
        ...lambdaConfig,
      },
    }) as Promise<ResetDailyMoodResult>;
  };

  return {
    getMeditationCourses,
    getHomepageInfo,
    getRecommendedSession,
    getHomePageText,
    getIntentionAndAffirmation,
    addMoodCheckIn,
    resetDailyMood,
    getMeditationCourseDetails,
    getMeditationAudioUrl,
  };
};
