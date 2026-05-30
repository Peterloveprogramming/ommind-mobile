import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import BackButton from "@/comp/headers/BackButton";
import useAwarenessLogs from "@/services/useAwarenessLogs";
import useDreamLogs from "@/services/useDreamLogs";
import { useToast } from "@/context/useToast";
import { FONTS } from "@/theme.js";

type JournalType = "dreams" | "awareness";
type DreamDetailKey =
  | "dreamTime"
  | "wakingFeeling"
  | "recurringDream"
  | "recentLifeConnection"
  | "stressLevel";

type DreamDetailSection = {
  key: DreamDetailKey;
  title: string;
  icon: ImageSourcePropType;
  options: string[];
};

const MAGIC_BULB_IMAGE = require("@/assets/images/journal/magic_bulb.png");
const DREAM_TIME_IMAGE = require("@/assets/images/journal/dream_time.png");
const WAKING_FEELING_IMAGE = require("@/assets/images/journal/waking_feeling.png");
const RECURRING_DREAM_IMAGE = require("@/assets/images/journal/recurring_dream.png");
const RECENT_LIFE_CONNECTION_IMAGE = require("@/assets/images/journal/recent_life_connection.png");
const STRESS_LEVEL_IMAGE = require("@/assets/images/journal/stress_level.png");

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

const DREAM_DETAIL_SECTIONS: DreamDetailSection[] = [
  {
    key: "dreamTime",
    title: "Dream time",
    icon: DREAM_TIME_IMAGE,
    options: [
      "Early night",
      "Middle of the night",
      "Early morning",
      "After 7am",
      "Not sure",
    ],
  },
  {
    key: "wakingFeeling",
    title: "Waking feeling",
    icon: WAKING_FEELING_IMAGE,
    options: ["Pleasant", "Unpleasant", "Neutral", "Mixed", "Not sure"],
  },
  {
    key: "recurringDream",
    title: "Recurring dream?",
    icon: RECURRING_DREAM_IMAGE,
    options: ["First time", "Recurring", "Not sure"],
  },
  {
    key: "recentLifeConnection",
    title: "Recent life connection",
    icon: RECENT_LIFE_CONNECTION_IMAGE,
    options: [
      "Work",
      "Relationship",
      "Family",
      "Health",
      "Spiritual practice",
      "Major change",
      "Not sure",
    ],
  },
  {
    key: "stressLevel",
    title: "Stress level",
    icon: STRESS_LEVEL_IMAGE,
    options: ["Low", "Moderate", "High", "Not sure"],
  },
];

const INITIAL_DREAM_DETAILS: Record<DreamDetailKey, string | null> = {
  dreamTime: null,
  wakingFeeling: null,
  recurringDream: null,
  recentLifeConnection: null,
  stressLevel: null,
};

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
  const [areDreamDetailsExpanded, setAreDreamDetailsExpanded] = useState(true);
  const [selectedDreamDetails, setSelectedDreamDetails] = useState(INITIAL_DREAM_DETAILS);

  const normalizedType: JournalType = type === "dreams" ? "dreams" : "awareness";
  const isDreamJournal = normalizedType === "dreams";
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
    isDreamJournal
      ? "Describe your dream as you remember it..."
      : "Write down whatever came up for you...";
  const journalInstructions =
    isDreamJournal ? DREAM_INSTRUCTIONS : AWARENESS_INSTRUCTIONS;

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

  const handleDreamDetailPress = (detailKey: DreamDetailKey, option: string) => {
    setSelectedDreamDetails((currentDetails) => ({
      ...currentDetails,
      [detailKey]: currentDetails[detailKey] === option ? null : option,
    }));
  };

  const renderDreamDetailsPanel = () => {
    if (!isDreamJournal) {
      return null;
    }

    return (
      <View style={styles.dreamDetailsCard}>
        <Pressable
          onPress={() => setAreDreamDetailsExpanded((isExpanded) => !isExpanded)}
          style={styles.dreamDetailsMainHeader}
          accessibilityRole="button"
          accessibilityLabel="Toggle optional dream details"
          accessibilityState={{ expanded: areDreamDetailsExpanded }}
        >
          <View style={styles.dreamDetailsMainHeaderTextWrap}>
            <Image source={MAGIC_BULB_IMAGE} style={styles.dreamDetailsSparkleIcon} />
            <Text style={styles.dreamDetailsMainTitle}>
              Optional details for a deeper reading
            </Text>
          </View>
          {!areDreamDetailsExpanded && (
            <Text style={styles.dreamDetailsCaret}>v</Text>
          )}
        </Pressable>

        {areDreamDetailsExpanded && (
          <>
            {DREAM_DETAIL_SECTIONS.map((section) => (
              <View key={section.key} style={styles.dreamDetailsSection}>
                <View style={styles.dreamDetailsSectionHeader}>
                  <Image source={section.icon} style={styles.dreamDetailsSectionIcon} />
                  <Text style={styles.dreamDetailsSectionTitle}>{section.title}</Text>
                </View>
                <View style={styles.dreamDetailsOptions}>
                  {section.options.map((option) => {
                    const isSelected = selectedDreamDetails[section.key] === option;

                    return (
                      <Pressable
                        key={`${section.key}-${option}`}
                        onPress={() => handleDreamDetailPress(section.key, option)}
                        style={[
                          styles.dreamDetailsOption,
                          isSelected && styles.dreamDetailsOptionSelected,
                        ]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                      >
                        <Text
                          style={[
                            styles.dreamDetailsOptionText,
                            isSelected && styles.dreamDetailsOptionTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}

            <Pressable
              onPress={() => setAreDreamDetailsExpanded(false)}
              style={styles.dreamDetailsCollapseButton}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Collapse optional dream details"
            >
              <Text style={styles.dreamDetailsCaret}>^</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  };

  const writingContent = (
    <>
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
        style={[styles.input, isDreamJournal && styles.dreamInput]}
      />

      {renderDreamDetailsPanel()}
    </>
  );

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

          {isDreamJournal ? (
            <ScrollView
              style={styles.dreamScrollView}
              contentContainerStyle={styles.dreamScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {writingContent}
            </ScrollView>
          ) : (
            writingContent
          )}
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
    marginRight: 15,
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
  dreamScrollView: {
    flex: 1,
  },
  dreamScrollContent: {
    paddingBottom: 24,
  },
  dreamInput: {
    flex: 0,
    minHeight: 118,
    maxHeight: 150,
  },
  dreamDetailsCard: {
    marginTop: 22,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E9E2DC",
    backgroundColor: "#FFFDFC",
  },
  dreamDetailsMainHeader: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dreamDetailsMainHeaderTextWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  dreamDetailsSparkleIcon: {
    width: 19,
    height: 19,
    marginRight: 10,
    resizeMode: "contain",
  },
  dreamDetailsMainTitle: {
    flex: 1,
    fontFamily: FONTS.figtreeMedium,
    fontSize: 17,
    lineHeight: 24,
    color: "#171717",
  },
  dreamDetailsSection: {
    marginTop: 24,
  },
  dreamDetailsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dreamDetailsSectionIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    resizeMode: "contain",
  },
  dreamDetailsSectionTitle: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 18,
    lineHeight: 25,
    color: "#111111",
  },
  dreamDetailsOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    rowGap: 8,
  },
  dreamDetailsOption: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEE2DC",
    backgroundColor: "#FFFDFC",
  },
  dreamDetailsOptionSelected: {
    borderColor: "#E5D6CE",
    backgroundColor: "#FFFFFF",
  },
  dreamDetailsOptionText: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 16,
    lineHeight: 22,
    color: "#777777",
  },
  dreamDetailsOptionTextSelected: {
    color: "#111111",
  },
  dreamDetailsCollapseButton: {
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  dreamDetailsCaret: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 18,
    lineHeight: 22,
    color: "#111111",
  },
});
