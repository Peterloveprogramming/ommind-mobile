import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { useWebsocketHexPcmAudio } from "@/services/useWebsocketHexPcmAudio";
import {
  getAudioServiceWebsocketUrl,
  requestAudioTestingAction,
} from "@/development_testing/services/audioTestingService";

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
  const { status, connect, playAudio, disconnect } = useWebsocketHexPcmAudio({ logRawData, wsUrl });

  const handlePlayAudio = async () => {
    try {
      await playAudio(input);
    } catch (error) {
      Alert.alert("Play audio failed", String(error));
    }
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      Alert.alert("WebSocket connection failed", String(error));
    }
  };

  const handleDisconnect = () => {
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
