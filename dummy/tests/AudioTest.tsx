import * as Sentry from "@sentry/react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { useWebsocketHexPcmAudio } from "@/services/useWebsocketHexPcmAudio";
import {
  getAudioServiceWebsocketUrl,
  requestAudioTestingAction,
} from "@/development_testing/services/audioTestingService";

type AudioTestingSentryData = Record<string, string | number | boolean | null | undefined>;

const toError = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error) {
    return error;
  }

  return new Error(`${fallbackMessage}: ${String(error)}`);
};

const sanitizeWsUrlForSentry = (wsUrl?: string): AudioTestingSentryData => {
  if (!wsUrl) {
    return {
      wsUrlPresent: false,
    };
  }

  try {
    const parsedUrl = new URL(wsUrl);

    return {
      wsUrlPresent: true,
      wsUrlProtocol: parsedUrl.protocol,
      wsUrlHost: parsedUrl.host,
      wsUrlPath: parsedUrl.pathname,
      wsUrlHasQuery: parsedUrl.search.length > 0,
    };
  } catch {
    return {
      wsUrlPresent: true,
      wsUrlParseFailed: true,
    };
  }
};

const addAudioTestingBreadcrumb = (
  message: string,
  data: AudioTestingSentryData = {}
) => {
  Sentry.addBreadcrumb({
    category: "audio_testing",
    message,
    level: "info",
    data,
  });
};

const captureAudioTestingException = (
  message: string,
  error: unknown,
  data: AudioTestingSentryData = {}
) => {
  Sentry.captureException(toError(error, message), {
    tags: {
      feature: "audio_testing",
    },
    extra: {
      ...data,
      originalError: error instanceof Error ? error.message : String(error),
    },
  });
};

type AudioTestProps = {
  logRawData?: boolean;
};

type AudioTestControlsProps = {
  isCheckingTextToAudioUrl: boolean;
  logRawData: boolean;
  onCheckTextToAudioUrl: () => Promise<void>;
  textToAudioUrl: string;
  wsUrl?: string;
};

export default function AudioTest({ logRawData = false }: AudioTestProps) {
  const [activeTextToAudioUrl, setActiveTextToAudioUrl] = useState<string | undefined>();
  const [textToAudioUrl, setTextToAudioUrl] = useState("");
  const [isCheckingTextToAudioUrl, setIsCheckingTextToAudioUrl] = useState(false);

  const handleCheckTextToAudioUrl = async () => {
    if (isCheckingTextToAudioUrl) return;

    setIsCheckingTextToAudioUrl(true);
    setTextToAudioUrl("Checking text to audio url...");

    try {
      const response = await requestAudioTestingAction("health");
      const wsUrl = getAudioServiceWebsocketUrl(response);
      setActiveTextToAudioUrl(wsUrl);
      setTextToAudioUrl(wsUrl ?? "Text to audio url unavailable.");
    } catch (error) {
      setTextToAudioUrl(`Text to audio url check failed: ${String(error)}`);
    } finally {
      setIsCheckingTextToAudioUrl(false);
    }
  };

  return (
    <AudioTestControls
      key={activeTextToAudioUrl ?? "default"}
      isCheckingTextToAudioUrl={isCheckingTextToAudioUrl}
      logRawData={logRawData}
      onCheckTextToAudioUrl={handleCheckTextToAudioUrl}
      textToAudioUrl={textToAudioUrl}
      wsUrl={activeTextToAudioUrl}
    />
  );
}

function AudioTestControls({
  isCheckingTextToAudioUrl,
  logRawData,
  onCheckTextToAudioUrl,
  textToAudioUrl,
  wsUrl,
}: AudioTestControlsProps) {
  const [input, setInput] = useState("hello world");
  const sentryContext = useMemo(
    () => ({
      ...sanitizeWsUrlForSentry(wsUrl),
      logRawData,
    }),
    [logRawData, wsUrl]
  );
  const handleWebsocketAudioError = useCallback(
    (error: unknown) => {
      captureAudioTestingException("websocket_audio_service_error", error, sentryContext);
    },
    [sentryContext]
  );
  const { status, playbackStatus, connect, playAudio, disconnect } = useWebsocketHexPcmAudio({
    logRawData,
    wsUrl,
    onError: handleWebsocketAudioError,
  });

  useEffect(() => {
    Sentry.setContext("audio_testing", sentryContext);

    return () => {
      Sentry.setContext("audio_testing", null);
    };
  }, [sentryContext]);

  useEffect(() => {
    addAudioTestingBreadcrumb("websocket_status_changed", {
      ...sentryContext,
      status,
      playbackStatus,
    });
  }, [playbackStatus, sentryContext, status]);

  const handlePlayAudio = async () => {
    const playContext = {
      ...sentryContext,
      status,
      playbackStatus,
      inputLength: input.trim().length,
    };

    addAudioTestingBreadcrumb("play_audio_pressed", playContext);

    try {
      await playAudio(input);
      addAudioTestingBreadcrumb("play_audio_finished", {
        ...playContext,
        nextStatus: status,
      });
    } catch (error) {
      captureAudioTestingException("play_audio_failed", error, playContext);
      Alert.alert("Play audio failed", String(error));
    }
  };

  const handleConnect = async () => {
    const connectContext = {
      ...sentryContext,
      status,
      playbackStatus,
    };

    addAudioTestingBreadcrumb("connect_websocket_pressed", connectContext);

    try {
      await connect();
      addAudioTestingBreadcrumb("connect_websocket_finished", connectContext);
    } catch (error) {
      captureAudioTestingException("connect_websocket_failed", error, connectContext);
      Alert.alert("WebSocket connection failed", String(error));
    }
  };

  const handleDisconnect = () => {
    addAudioTestingBreadcrumb("disconnect_websocket_pressed", {
      ...sentryContext,
      status,
      playbackStatus,
    });
    disconnect();
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 16, gap: 12 }}>
      <Text>Status: {status}</Text>
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Type text to stream..."
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 8,
        }}
      />
      <Button
        disabled={isCheckingTextToAudioUrl}
        onPress={onCheckTextToAudioUrl}
        title={isCheckingTextToAudioUrl ? "Checking..." : "Check"}
      />
      {textToAudioUrl ? <Text selectable>{textToAudioUrl}</Text> : null}
      <Button onPress={handleConnect} title="Connect WebSocket" />
      <Button onPress={handlePlayAudio} title="Play Audio" />
      <Button onPress={handleDisconnect} title="Disconnect" />
    </View>
  );
}
