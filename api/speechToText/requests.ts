import { AUDIO_TO_TEXT_URL, SECRET_TOKEN } from "@/constant";

export type SpeechToTextAudioFile = {
  uri: string;
  name?: string;
  type?: string;
};

export type SpeechToTextResponse = Record<string, unknown>;

export async function convertAudioFileToTextRequest(
  audioFile: SpeechToTextAudioFile
): Promise<SpeechToTextResponse> {
  if (!audioFile?.uri?.trim()) {
    throw new Error("audio file uri is required");
  }

  const formData = new FormData();
  formData.append("audio_file", {
    uri: audioFile.uri,
    name: audioFile.name ?? "recording.m4a",
    type: audioFile.type ?? "audio/m4a",
  } as unknown as Blob);

  const response = await fetch(AUDIO_TO_TEXT_URL, {
    method: "POST",
    headers: {
      Authorization: SECRET_TOKEN,
    },
    body: formData,
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `audio to text request failed (${response.status}): ${responseText || "unknown error"}`
    );
  }

  return (await response.json()) as SpeechToTextResponse;
}
