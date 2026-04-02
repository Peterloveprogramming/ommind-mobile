import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import BackButton from "@/comp/headers/BackButton";
import { useToast } from "@/context/useToast";
import { FONTS } from "@/theme.js";

type JournalType = "dreams" | "awareness";

const formatEntryDate = () =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

export default function JournalWriteScreen() {
  const { type, title } = useLocalSearchParams<{
    type?: JournalType;
    title?: string;
  }>();
  const { showToastMessage } = useToast();
  const [entryText, setEntryText] = useState("");

  const normalizedType: JournalType = type === "dreams" ? "dreams" : "awareness";

  const screenTitle = useMemo(() => {
    if (title) {
      return title;
    }

    const dateLabel = formatEntryDate();
    return normalizedType === "dreams"
      ? `Dream on ${dateLabel}`
      : `Awareness on ${dateLabel}`;
  }, [normalizedType, title]);

  const placeholderText =
    normalizedType === "dreams"
      ? "Describe your dream as you remember it..."
      : "Write down whatever came up for you...";

  const handleSave = () => {
    showToastMessage("Journal entry saved", true);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <BackButton onTouch={() => router.back()} />
            <Pressable onPress={handleSave} hitSlop={12}>
              {({ pressed }) => (
                <Text style={[styles.saveText, pressed && styles.saveTextPressed]}>Save</Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.title}>{screenTitle}</Text>

          <TextInput
            autoFocus
            multiline
            value={entryText}
            onChangeText={setEntryText}
            placeholder={placeholderText}
            placeholderTextColor="#9A9AA0"
            textAlignVertical="top"
            scrollEnabled
            style={styles.input}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FBFBF8",
    paddingHorizontal:25,
    paddingVertical:50,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: "#FBFBF8",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  saveText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 19,
    color: "#9E9EA4",
  },
  saveTextPressed: {
    opacity: 0.65,
  },
  title: {
    marginTop: 22,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 18,
    color: "#171717",
  },
  input: {
    flex: 1,
    marginTop: 18,
    fontFamily: FONTS.figtreeMedium,
    fontSize: 16,
    lineHeight: 28,
    color: "#8C8C8A",
    padding: 0,
  },
});
