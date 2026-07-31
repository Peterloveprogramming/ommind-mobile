import { File } from "expo-file-system";
import { AUDIO_TO_TEXT_URL, SECRET_TOKEN } from "@/constant";

export type SpeechToTextAudioFile = {
  uri: string;
  name?: string;
  type?: string;
};

export type SpeechToTextResponse = Record<string, unknown>;

const CONVERT_AUDIO_TO_TEXT_ROUTE = "convert_audio_to_text";

export async function convertAudioFileToTextRequest(
  audioFile: SpeechToTextAudioFile
): Promise<SpeechToTextResponse> {
  if (!audioFile?.uri?.trim()) {
    throw new Error("audio file uri is required");
  }

  const filename = audioFile.name ?? "recording.m4a";
  const audioFileBase64 = await new File(audioFile.uri).base64();

  const response = await fetch(AUDIO_TO_TEXT_URL, {
    method: "POST",
    headers: {
      Authorization: SECRET_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route: CONVERT_AUDIO_TO_TEXT_ROUTE,
      filename,
      audio_file_base64: audioFileBase64,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `audio to text request failed (${response.status}): ${responseText || "unknown error"}`
    );
  }

  return (await response.json()) as SpeechToTextResponse;
}
