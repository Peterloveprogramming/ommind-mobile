import { useCallback, useRef, useState } from "react";
import {
  SpeechToTextAudioFile,
  SpeechToTextResponse,
} from "@/api/useSpeechToTextService/requests";
import {
  SpeechToTextService,
  SpeechToTextServiceOptions,
  SpeechToTextStatus,
} from "@/services/speechToTextService";

type UseSpeechToTextServiceOptions = SpeechToTextServiceOptions;

export function useSpeechToTextService(options: UseSpeechToTextServiceOptions = {}) {
  const [status, setStatus] = useState<SpeechToTextStatus>("idle");
  const [result, setResult] = useState<SpeechToTextResponse | null>(null);
  const [error, setError] = useState<unknown>(null);
  const serviceRef = useRef<SpeechToTextService | null>(null);

  if (!serviceRef.current) {
    serviceRef.current = new SpeechToTextService({
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

  const convertAudioToText = useCallback(async (audioFile: SpeechToTextAudioFile) => {
    setError(null);
    return await serviceRef.current!.convertAudioToText(audioFile);
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    serviceRef.current?.reset();
  }, []);

  return {
    status,
    isConverting: status === "converting",
    result,
    error,
    convertAudioToText,
    reset,
    service: serviceRef.current,
  };
}
