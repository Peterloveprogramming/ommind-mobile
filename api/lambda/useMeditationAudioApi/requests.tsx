import { useFetch } from "@/api/useFetch";
import { LAMBDA_SERVICE_URL } from "@/constant";
import { LambdaRequest, LambdaResult } from "@/api/types";

export type GetMeditationAudioInput = {
  type: string;
  course_number: number;
  session_number: number;
};

export type MeditationAudioUrls = {
  audio: string[];
  bgm: string[];
};

export type GetMeditationAudioUrlResult = LambdaResult<MeditationAudioUrls | null>;

export const useGetMeditationAudioUrl = () => {
  const { commonFetch } = useFetch<GetMeditationAudioUrlResult>({
    url: LAMBDA_SERVICE_URL,
    method: "POST",
    clearUserInfoFromCacheIfUnauthorized: true,
    useAuthFromCache: true,
  });

  const lambdaConfig: LambdaRequest = {
    route: "get_audio_url",
  };

  const getMeditationAudioUrl = (input: GetMeditationAudioInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        ...input,
      },
    });

  return { getMeditationAudioUrl };
};
