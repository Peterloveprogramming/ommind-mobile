import { TEXT_TO_AUDIO_URL } from "@/constant";
import { useWebsocketHexPcmAudio } from "@/services/useWebsocketHexPcmAudio";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

export default function WebsocketConnectionTest() {
  const [lastResult, setLastResult] = useState("Not tested yet");
  const { status, connect, disconnect } = useWebsocketHexPcmAudio();

  const handleConnect = async () => {
    setLastResult("Connecting...");

    try {
      await connect();
      setLastResult("Connected successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setLastResult(`Connection failed: ${message}`);
      Alert.alert("WebSocket connection failed", message);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setLastResult("Disconnected");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WebSocket Connection Test</Text>
      <Text style={styles.label}>URL</Text>
      <Text style={styles.value}>{TEXT_TO_AUDIO_URL}</Text>
      <Text style={styles.label}>Status</Text>
      <Text style={styles.value}>{status}</Text>
      <Text style={styles.label}>Last result</Text>
      <Text style={styles.value}>{lastResult}</Text>
      <View style={styles.actions}>
        <Button title="Connect" onPress={() => void handleConnect()} />
        <Button title="Disconnect" onPress={handleDisconnect} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  label: {
    color: "#666",
    fontSize: 13,
  },
  value: {
    fontSize: 16,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
});
