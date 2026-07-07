import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { useWebsocketHexPcmAudio } from "@/services/useWebsocketHexPcmAudio";

type AudioTestProps = {
  logRawData?: boolean;
};

export default function AudioTest({ logRawData = false }: AudioTestProps) {
  const [input, setInput] = useState("hello world");
  const { status, playAudio, disconnect } = useWebsocketHexPcmAudio({ logRawData });

  const handlePlayAudio = async () => {
    try {
      await playAudio(input);
    } catch (error) {
      Alert.alert("Play audio failed", String(error));
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
      <Button onPress={handlePlayAudio} title="Play Audio" />
      <Button onPress={handleDisconnect} title="Disconnect" />
    </View>
  );
}
