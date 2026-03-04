import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

const Profile = () => {
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useSpeechRecognitionEvent("start", () => {
    setRecognizing(true);
    setErrorMessage("");
    console.log("[speech-demo] recognition started");
  });

  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
    console.log("[speech-demo] recognition ended");
  });

  useSpeechRecognitionEvent("result", (event) => {
    const nextTranscript =
      event.results
        .map((result) => result.transcript)
        .join(" ")
        .trim() || "";

    setTranscript(nextTranscript);
    console.log("[speech-demo] result:", nextTranscript, "isFinal:", event.isFinal);
  });

  useSpeechRecognitionEvent("error", (event) => {
    const nextError = `${event.error}: ${event.message}`;
    setRecognizing(false);
    setErrorMessage(nextError);
    console.log("[speech-demo] error:", nextError);
  });

  const handleStart = async () => {
    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Speech recognition permission was not granted.");
        return;
      }

      setTranscript("");
      setErrorMessage("");

      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        maxAlternatives: 1,
        continuous: true,
        requiresOnDeviceRecognition: false,
        addsPunctuation: Platform.OS === "android",
      });
    } catch (error) {
      const nextError = String(error);
      setErrorMessage(nextError);
      console.log("[speech-demo] start failed:", nextError);
    }
  };

  const handleStop = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speech Recognition Demo</Text>
      <Text style={styles.subtitle}>
        Example usage based on the `expo-speech-recognition` hook pattern.
      </Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Status</Text>
        <Text style={styles.statusValue}>{recognizing ? "Listening" : "Idle"}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleStart}
          style={[styles.button, recognizing && styles.buttonDisabled]}
          disabled={recognizing}
        >
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleStop}
          style={[styles.button, !recognizing && styles.buttonSecondary]}
        >
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.outputCard} contentContainerStyle={styles.outputContent}>
        <Text style={styles.outputLabel}>Transcript</Text>
        <Text style={styles.outputText}>
          {transcript || "Tap Start and begin speaking to see recognition results here."}
        </Text>

        {errorMessage ? (
          <>
            <Text style={styles.errorLabel}>Error</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F2EA",
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
    gap: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2F2A24",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#645B52",
  },
  statusCard: {
    backgroundColor: "#FFFDF9",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5DDD2",
  },
  statusLabel: {
    fontSize: 13,
    color: "#7C7267",
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2F2A24",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: "#8C8C8A",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSecondary: {
    backgroundColor: "#B8AEA2",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  outputCard: {
    flex: 1,
    backgroundColor: "#FFFDF9",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5DDD2",
  },
  outputContent: {
    padding: 16,
    gap: 10,
  },
  outputLabel: {
    fontSize: 13,
    color: "#7C7267",
  },
  outputText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#2F2A24",
  },
  errorLabel: {
    marginTop: 12,
    fontSize: 13,
    color: "#9E4D3B",
  },
  errorText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#9E4D3B",
  },
});
