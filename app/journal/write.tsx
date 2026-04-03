import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
