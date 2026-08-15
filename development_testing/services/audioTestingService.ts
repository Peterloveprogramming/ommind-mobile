import {
  LAMBDA_SERVICE_API_KEY,
  TEXT_AUDIO_TESTING_URL,
  setTextToAudioUrl,
} from "@/constant";

export type AudioTestingAction = "start" | "stop" | "health";

type AudioTestingTask = {
  publicIp?: string;
};

export type AudioTestingResponse = {
  statusCode?: number | string;
  response?: string;
  data?: {
    action?: AudioTestingAction;
    status?: string;
    isRunning?: boolean;
    publicIp?: string;
    tasks?: AudioTestingTask[];
  };
};

const AUDIO_WEBSOCKET_PORT = 9001;

const getPublicIp = (response: AudioTestingResponse) =>
  response.data?.publicIp ?? response.data?.tasks?.find((task) => task.publicIp)?.publicIp;

const isSuccess = (response: AudioTestingResponse) => {
  const statusCode = response.statusCode;
  if (typeof statusCode === "number") return statusCode >= 200 && statusCode < 300;
  if (typeof statusCode === "string") return statusCode.startsWith("2");
  return false;
};

export const getAudioServiceWebsocketUrl = (response: AudioTestingResponse) => {
  const publicIp = getPublicIp(response);
  return publicIp ? `ws://${publicIp}:${AUDIO_WEBSOCKET_PORT}` : undefined;
};

export const requestAudioTestingAction = async (
  action: AudioTestingAction
): Promise<AudioTestingResponse> => {
  const response = await fetch(TEXT_AUDIO_TESTING_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": LAMBDA_SERVICE_API_KEY,
    },
    body: JSON.stringify({ action }),
  });

  if (!response.ok) {
    throw new Error(`Audio testing request failed with status ${response.status}`);
  }

  const data = (await response.json()) as AudioTestingResponse;

  if (!isSuccess(data)) {
    throw new Error(data.response || "Audio testing request failed");
  }

  const wsUrl = getAudioServiceWebsocketUrl(data);
  if (wsUrl && action !== "stop") {
    setTextToAudioUrl(wsUrl);
  }

  return data;
};

export const sendAudioTestingAction = (action: AudioTestingAction) => {
  void fetch(TEXT_AUDIO_TESTING_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": LAMBDA_SERVICE_API_KEY,
    },
    body: JSON.stringify({ action }),
  }).catch((error) => {
    console.warn(`Unable to send audio testing action ${action}`, error);
  });
};
