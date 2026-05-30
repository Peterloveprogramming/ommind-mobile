import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
import useAwarenessLogs from "@/services/useAwarenessLogs";
import useDreamLogs from "@/services/useDreamLogs";
import { useToast } from "@/context/useToast";
import { FONTS } from "@/theme.js";

type JournalType = "dreams" | "awareness";

const MAGIC_BULB_IMAGE = require("@/assets/images/journal/magic_bulb.png");

const DREAM_INSTRUCTIONS = [
  "What happened in the dream?",
  "What felt unusual or meaningful?",
  "What emotions were present?",
  "What image, symbol, or moment stayed with you?",
];

const AWARENESS_INSTRUCTIONS = [
  "When did you feel most present today?",
  "What thoughts or emotions stood out today?",
  "What did you notice in your body or breathing today?",
  "What did you learn or notice about your mind today?",
];

const formatEntryDate = () =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

export default function JournalWriteScreen() {
  const { type, title, logId, content } = useLocalSearchParams<{
    type?: JournalType;
    title?: string;
    logId?: string;
    content?: string;
  }>();
  const { showToastMessage } = useToast();
  const {
    createDreamLog,
    updateDreamLog,
    isCreating,
    isUpdating,
  } = useDreamLogs();
  const {
    createAwarenessLog,
    updateAwarenessLog,
    isCreating: isCreatingAwarenessLog,
    isUpdating: isUpdatingAwarenessLog,
  } = useAwarenessLogs();
  const [entryText, setEntryText] = useState(typeof content === "string" ? content : "");
  const [areInstructionsVisible, setAreInstructionsVisible] = useState(false);

  const normalizedType: JournalType = type === "dreams" ? "dreams" : "awareness";
  const isEditMode = typeof logId === "string" && logId.trim().length > 0;

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
  const journalInstructions =
    normalizedType === "dreams" ? DREAM_INSTRUCTIONS : AWARENESS_INSTRUCTIONS;

  const isSaving =
    isCreating || isCreatingAwarenessLog || isUpdating || isUpdatingAwarenessLog;
  const isSaveDisabled = entryText.trim().length === 0 || isSaving;

  const navigateBackToJournal = () => {
    router.replace({
      pathname: "/journal",
      params: { activeTab: normalizedType },
    });
  };

  const handleSave = async () => {
    const trimmedEntryText = entryText.trim();

    if (!trimmedEntryText || isSaving) {
      return;
    }

    if (normalizedType === "awareness") {
      const savedAwarenessLog = isEditMode
        ? await updateAwarenessLog({
            log_id: logId,
            log: trimmedEntryText,
          })
        : await createAwarenessLog({
            log: trimmedEntryText,
          });

      if (!savedAwarenessLog) {
        return;
      }

      showToastMessage(isEditMode ? "Awareness log updated" : "Awareness log saved", true);
      navigateBackToJournal();
      return;
    }

    const savedDreamLog = isEditMode
      ? await updateDreamLog({
          dream_log_id: logId,
          log: trimmedEntryText,
        })
      : await createDreamLog({
          log: trimmedEntryText,
        });

    if (!savedDreamLog) {
      return;
    }

    showToastMessage(isEditMode ? "Dream log updated" : "Dream log saved", true);
    navigateBackToJournal();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <BackButton onTouch={navigateBackToJournal} />
            <Pressable onPress={handleSave} hitSlop={12} disabled={isSaveDisabled}>
              {({ pressed }) => (
                <View style={styles.saveAction}>
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#9E9EA4" />
                  ) : (
                    <Text
                      style={[
                        styles.saveText,
                        isSaveDisabled && styles.saveTextDisabled,
                        pressed && !isSaveDisabled && styles.saveTextPressed,
                      ]}
                    >
                      {isEditMode ? "Update" : "Save"}
                    </Text>
                  )}
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.instructionsActionRow}>
            <Pressable
              onPress={() => setAreInstructionsVisible((isVisible) => !isVisible)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Show journal writing instructions"
              accessibilityState={{ expanded: areInstructionsVisible }}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.instructionsButton,
                    pressed && styles.instructionsButtonPressed,
                  ]}
                >
                  <Image source={MAGIC_BULB_IMAGE} style={styles.instructionsIcon} />
                </View>
              )}
            </Pressable>
          </View>

          <Text style={styles.title}>{screenTitle}</Text>

          {areInstructionsVisible && (
            <View style={styles.instructionsPanel}>
              {journalInstructions.map((instruction) => (
                <Text key={instruction} style={styles.instructionsText}>
                  {instruction}
                </Text>
              ))}
            </View>
          )}

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
  instructionsActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 10,
    marginRight:15
  },
  instructionsButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(23, 23, 23, 0.04)",
  },
  instructionsButtonPressed: {
    opacity: 0.65,
  },
  instructionsIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    opacity: 0.72,
  },
  saveText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 19,
    color: "#9E9EA4",
  },
  saveAction: {
    minWidth: 48,
    minHeight: 24,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  saveTextPressed: {
    opacity: 0.65,
  },
  saveTextDisabled: {
    opacity: 0.45,
  },
  title: {
    marginTop: 22,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 18,
    color: "#171717",
  },
  instructionsPanel: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F2F2EF",
  },
  instructionsText: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "#6F6F6B",
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
