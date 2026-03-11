import { useCallback, useRef, useState } from "react";
import {
  GetMeditationAudioInput,
  GetMeditationAudioUrlResult,
  useGetMeditationAudioUrl,
} from "@/api/lambda/useMeditationAudioApi/requests";
import {
  MeditationAudioService,
  MeditationAudioServiceOptions,
  MeditationAudioStatus,
} from "@/services/meditationAudioService";

type UseMeditationAudioServiceOptions = MeditationAudioServiceOptions;

export function useMeditationAudioService(options: UseMeditationAudioServiceOptions = {}) {
  const [status, setStatus] = useState<MeditationAudioStatus>("idle");
  const [result, setResult] = useState<GetMeditationAudioUrlResult | null>(null);
  const [error, setError] = useState<unknown>(null);
  const { getMeditationAudioUrl } = useGetMeditationAudioUrl();

  const serviceRef = useRef<MeditationAudioService | null>(null);

  if (!serviceRef.current) {
    serviceRef.current = new MeditationAudioService(getMeditationAudioUrl, {
      ...options,
      onStatusChange: (nextStatus) => {
        setStatus(nextStatus);
        options.onStatusChange?.(nextStatus);
      },
      onResult: (nextResult) => {
        setResult(nextResult);
        options.onResult?.(nextResult);
      },
      onError: (nextError) => {
        setError(nextError);
        options.onError?.(nextError);
      },
    });
  }

  const fetchMeditationAudioUrl = useCallback(
    async (input: GetMeditationAudioInput) => {
      setError(null);
      return await serviceRef.current!.getAudioUrl(input);
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    serviceRef.current?.reset();
  }, []);

  return {
    status,
    isLoading: status === "loading",
    result,
    error,
    fetchMeditationAudioUrl,
    reset,
    service: serviceRef.current,
  };
}
