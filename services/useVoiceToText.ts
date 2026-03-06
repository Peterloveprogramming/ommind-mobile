import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useSpeechToTextService } from "@/services/useSpeechToTextService";

type VoiceToTextStatus = "idle" | "recording" | "converting" | "error";

type UseVoiceToTextOptions = {
  onTranscript?: (text: string) => void;
  onError?: (error: unknown) => void;
};

const extractTranscript = (result: Record<string, unknown> | null): string => {
  if (!result) return "";

  const directData = result.data;
  if (typeof directData === "string") return directData.trim();

  if (directData && typeof directData === "object") {
    const dataObj = directData as Record<string, unknown>;
    const candidate =
      dataObj.text ??
      dataObj.transcript ??
      dataObj.transcription ??
      dataObj.result;
    if (typeof candidate === "string") return candidate.trim();
  }

  return "";
};

export function useVoiceToText(options: UseVoiceToTextOptions = {}) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [lastError, setLastError] = useState<unknown>(null);
  const [lastTranscript, setLastTranscript] = useState("");

  const {
    status: speechStatus,
    result: speechResult,
    error: speechError,
    convertAudioToText,
  } = useSpeechToTextService({
    onError: (error) => {
      setLastError(error);
      options.onError?.(error);
    },
  });

  const status: VoiceToTextStatus = useMemo(() => {
    if (recorderState.isRecording) return "recording";
    if (speechStatus === "converting") return "converting";
    if (speechStatus === "error") return "error";
    return "idle";
  }, [recorderState.isRecording, speechStatus]);

  const startRecording = useCallback(async () => {
    if (recorderState.isRecording) return;

    const permissionStatus = await AudioModule.requestRecordingPermissionsAsync();
    if (!permissionStatus.granted) {
      throw new Error("Microphone permission denied");
    }

    setLastError(null);
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
    });
    await recorder.prepareToRecordAsync();
    recorder.record();
  }, [recorder, recorderState.isRecording]);

  const stopRecordingAndTranscribe = useCallback(async (): Promise<string> => {
    if (!recorderState.isRecording) {
      return "";
    }

    await recorder.stop();
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
    });

    const recordedUri = recorder.uri ?? recorderState.url ?? null;
    if (!recordedUri) {
      throw new Error("No recording URI found");
    }

    const result = (await convertAudioToText({
      uri: recordedUri,
      name: "recording.m4a",
      type: "audio/m4a",
    })) as Record<string, unknown>;
    const transcript = extractTranscript(result);

    if (transcript) {
      setLastTranscript(transcript);
      options.onTranscript?.(transcript);
    }

    return transcript;
  }, [recorder, recorderState.isRecording, recorderState.url, convertAudioToText, options]);

  useEffect(() => {
    return () => {
      void setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
    };
  }, []);

  return {
    status,
    isRecording: recorderState.isRecording,
    isConverting: speechStatus === "converting",
    error: lastError ?? speechError,
    result: speechResult,
    lastTranscript,
    startRecording,
    stopRecordingAndTranscribe,
  };
}
