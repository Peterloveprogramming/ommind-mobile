import { useMeditationApi } from "@/api/lambda/meditation/requests";

export type {
  GetMeditationAudioInput,
  GetMeditationAudioUrlResult,
  MeditationAudioUrls,
} from "@/api/lambda/meditation/types";

export const useGetMeditationAudioUrl = () => {
  const { getMeditationAudioUrl } = useMeditationApi();
  return { getMeditationAudioUrl };
};
