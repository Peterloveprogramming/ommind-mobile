import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { FONTS } from "@/theme";
import { useMeditationAudioService } from "@/services/useMeditationAudioService";

const getSingleParam = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const SessionPlayer = () => {
  const params = useLocalSearchParams<{
    title?: string | string[];
    type?: string | string[];
    course_number?: string | string[];
    session_number?: string | string[];
  }>();
  const { status, result, error, fetchMeditationAudioUrl } = useMeditationAudioService();

  useEffect(() => {
    const meditationType = getSingleParam(params.type);
    const courseNumber = Number(getSingleParam(params.course_number));
    const sessionNumber = Number(getSingleParam(params.session_number));

    if (!meditationType || Number.isNaN(courseNumber) || Number.isNaN(sessionNumber)) {
      return;
    }

    void fetchMeditationAudioUrl({
      type: meditationType,
      course_number: courseNumber,
      session_number: sessionNumber,
    });
  }, [fetchMeditationAudioUrl, params.course_number, params.session_number, params.type]);

  const audioUrl = result?.data?.audio?.[0];
  const bgmUrl = result?.data?.bgm?.[0];
  const title = getSingleParam(params.title);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title ?? "Session Player"}</Text>
      <Text style={styles.meta}>Status: {status}</Text>
      <Text style={styles.label}>Audio URL</Text>
      <Text style={styles.value}>{audioUrl ?? "No audio URL loaded"}</Text>
      <Text style={styles.label}>BGM URL</Text>
      <Text style={styles.value}>{bgmUrl ?? "No bgm URL loaded"}</Text>
      {error ? <Text style={styles.error}>Failed to load meditation audio endpoint.</Text> : null}
    </View>
  );
};

export default SessionPlayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  title: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 24,
    marginBottom: 16,
  },
  meta: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 14,
    marginBottom: 20,
    color: "#8E8E93",
  },
  label: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 16,
    marginBottom: 8,
  },
  value: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 14,
    color: "#444444",
    marginBottom: 20,
  },
  error: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 14,
    color: "#B3261E",
  },
});
