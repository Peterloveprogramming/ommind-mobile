import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { usePreventRemove } from "@react-navigation/native";
import { KeyboardAwareScrollView, KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DreamBackButton from "@/assets/svg/journal/DreamBackButton";
import MagicStick from "@/assets/svg/journal/MagicStick";
import useDreamLogs from "@/api/dreamLogs/useDreamLogs";
import { useToast } from "@/context/useToast";
import { COLORS, FONTS } from "@/theme.js";
import { generateUniqueId } from "@/utils/helper";
import DreamDetailsCard from "./DreamDetailsCard";
import ReflectionPromptsFooter from "./ReflectionPromptsFooter";
import {
  buildDreamLogPayload,
  cleanDreamDetailValue,
  getSelectedDreamDetailOption,
  hasAnyDreamDetail,
  serializeDreamLogPayload,
  type DreamDetailChipSection,
  type DreamDetailKey,
  type DreamDetailValues,
  type DreamLogPayload,
} from "./dreamDetails";

export const DREAM_INSTRUCTIONS = [
  "What happened in the dream?",
  "What felt unusual or meaningful?",
  "What emotions were present?",
  "What image, symbol, or moment stayed with you?",
];

const BACKGROUND_COLOR = "#FAFAFA";
const MAX_FONT_SIZE_MULTIPLIER = 1.3;
// Gap between the footer and the bottom inset / keyboard (Figma 2631:10316).
const FOOTER_GAP = 15;

export type DreamJournalEditorProps = {
  title?: string;
  logId?: string;
  content?: string;
  initialDetails: DreamDetailValues;
};

// Figma uses the US order: "Dream on July 7, 2025".
const formatDreamEntryDate = () =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

const navigateBackToJournal = () => {
  router.replace({
    pathname: "/journal",
    params: { activeTab: "dreams" },
  });
};

export default function DreamJournalEditor({
  title,
  logId,
  content,
  initialDetails,
}: DreamJournalEditorProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { showToastMessage } = useToast();
  const { createDreamLog, updateDreamLog, deleteDreamLog } = useDreamLogs();

  const initialLogId = cleanDreamDetailValue(logId);
  const initialText = typeof content === "string" ? content : "";

  const [entryText, setEntryText] = useState(initialText);
  const [details, setDetails] = useState<DreamDetailValues>(initialDetails);
  const [touchedDetailKeys, setTouchedDetailKeys] = useState<Set<DreamDetailKey>>(
    () => new Set()
  );
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(
    () => initialLogId !== null && hasAnyDreamDetail(initialDetails)
  );
  const [arePromptsVisible, setArePromptsVisible] = useState(false);
  const [savedLogId, setSavedLogId] = useState<string | null>(initialLogId);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(() =>
    initialLogId ? serializeDreamLogPayload(buildDreamLogPayload(initialText, initialDetails)) : null
  );
  const [isBusy, setIsBusy] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [footerHeight, setFooterHeight] = useState(0);

  // Refs mirror state for the remove listener and guard against double taps
  // between a setState call and the next render.
  const savedLogIdRef = useRef(savedLogId);
  const isBusyRef = useRef(false);
  const allowRemoveRef = useRef(false);

  const isEditMode = savedLogId !== null;
  const trimmedText = entryText.trim();
  const payload = useMemo(() => buildDreamLogPayload(entryText, details), [entryText, details]);
  const isDirty = serializeDreamLogPayload(payload) !== lastSavedSnapshot;
  // Leaving needs handling when there's something to save, or when an
  // existing entry's text was cleared (changes are dropped with a notice).
  const shouldInterceptRemove = isDirty && (trimmedText.length > 0 || isEditMode);

  const screenTitle = useMemo(
    () => title || `Dream on ${formatDreamEntryDate()}`,
    [title]
  );

  const setBusy = (nextIsBusy: boolean) => {
    isBusyRef.current = nextIsBusy;
    setIsBusy(nextIsBusy);
  };

  const leaveWithoutSaving = (continueNavigation?: () => void) => {
    allowRemoveRef.current = true;
    (continueNavigation ?? navigateBackToJournal)();
  };

  /** Create or update the dream; on success remember the id and snapshot. */
  const saveDream = async (dreamPayload: DreamLogPayload) => {
    const currentLogId = savedLogIdRef.current;
    const savedDreamLog = currentLogId
      ? await updateDreamLog({ dream_log_id: currentLogId, ...dreamPayload })
      : await createDreamLog(dreamPayload);

    if (!savedDreamLog) {
      return null;
    }

    const nextLogId =
      savedDreamLog.id !== undefined && savedDreamLog.id !== null
        ? String(savedDreamLog.id)
        : currentLogId;
    savedLogIdRef.current = nextLogId;
    setSavedLogId(nextLogId);
    setLastSavedSnapshot(serializeDreamLogPayload(dreamPayload));
    return { logId: nextLogId, wasUpdate: currentLogId !== null };
  };

  const handleLeave = async (continueNavigation?: () => void) => {
    if (isBusyRef.current) {
      return;
    }

    if (!payload.log) {
      if (isEditMode && isDirty) {
        showToastMessage("Dream text can't be empty — changes not saved", false);
      }
      leaveWithoutSaving(continueNavigation);
      return;
    }

    if (!isDirty) {
      leaveWithoutSaving(continueNavigation);
      return;
    }

    setBusy(true);
    try {
      const saveResult = await saveDream(payload);
      if (!saveResult) {
        // The hook already showed the error; stay so the text isn't lost.
        return;
      }

      showToastMessage(saveResult.wasUpdate ? "Dream log updated" : "Dream log saved", true);
      allowRemoveRef.current = true;
      navigateBackToJournal();
    } finally {
      setBusy(false);
    }
  };

  // Covers header back, Android hardware back and iOS swipe-back.
  // Programmatic exits (after save/delete) set allowRemoveRef and go through.
  usePreventRemove(shouldInterceptRemove, ({ data }) => {
    const continueNavigation = () => navigation.dispatch(data.action);
    if (allowRemoveRef.current) {
      continueNavigation();
      return;
    }
    void handleLeave(continueNavigation);
  });

  const handleGetAiReflection = async () => {
    if (isBusyRef.current) {
      return;
    }

    if (!payload.log) {
      showToastMessage("Write a dream before analyzing.", false);
      return;
    }

    setBusy(true);
    setIsAnalyzing(true);
    try {
      let dreamLogId = savedLogIdRef.current;
      if (isDirty || !dreamLogId) {
        const saveResult = await saveDream(payload);
        if (!saveResult) {
          return;
        }
        dreamLogId = saveResult.logId;
      }

      // The analysis is loaded server-side by dream log id, so one must exist.
      if (!dreamLogId) {
        showToastMessage("Couldn't start dream analysis. Please try again.", false);
        return;
      }

      router.push({
        pathname: "/chat/new_index",
        params: {
          session_id: generateUniqueId(),
          dream_analysis_payload: JSON.stringify({
            dreamLogId,
            dreamJournal: payload.log,
          }),
        },
      });
    } finally {
      setIsAnalyzing(false);
      setBusy(false);
    }
  };

  const deleteEntry = async () => {
    const currentLogId = savedLogIdRef.current;
    if (!currentLogId) {
      leaveWithoutSaving();
      return;
    }

    setBusy(true);
    try {
      const isDeleted = await deleteDreamLog({ dream_log_id: currentLogId });
      if (!isDeleted) {
        return;
      }

      showToastMessage("Dream log deleted", true);
      leaveWithoutSaving();
    } finally {
      setBusy(false);
    }
  };

  const handleDeletePress = () => {
    if (isBusyRef.current) {
      return;
    }

    Alert.alert("Delete dream?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void deleteEntry() },
    ]);
  };

  const handleChipPress = useCallback(
    (section: DreamDetailChipSection, option: string) => {
      const isTouched = touchedDetailKeys.has(section.key);

      setDetails((currentDetails) => {
        const currentValue = currentDetails[section.key];
        const isSelected = getSelectedDreamDetailOption(section, currentValue) === option;
        // An untouched legacy value (e.g. "Moderate") shows its chip selected;
        // the first tap adopts the chip label instead of clearing it.
        const isLegacyAlias = isSelected && !isTouched && currentValue !== option;

        return {
          ...currentDetails,
          [section.key]: isSelected && !isLegacyAlias ? null : option,
        };
      });
      setTouchedDetailKeys((currentKeys) => new Set(currentKeys).add(section.key));
    },
    [touchedDetailKeys]
  );

  const handleDetailTextChange = useCallback((detailKey: DreamDetailKey, text: string) => {
    setDetails((currentDetails) => ({ ...currentDetails, [detailKey]: text }));
    setTouchedDetailKeys((currentKeys) => new Set(currentKeys).add(detailKey));
  }, []);

  const handleFooterLayout = (event: LayoutChangeEvent) => {
    setFooterHeight(event.nativeEvent.layout.height);
  };

  const isAiReflectionDisabled = trimmedText.length === 0 || isBusy;
  const footerBottom = insets.bottom + FOOTER_GAP;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          onPress={() => void handleLeave()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          {({ pressed }) => (
            <View style={pressed && styles.pressed}>
              <DreamBackButton />
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={() => void handleGetAiReflection()}
          disabled={isAiReflectionDisabled}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Get AI Reflection"
          accessibilityState={{ disabled: isAiReflectionDisabled, busy: isAnalyzing }}
          style={({ pressed }) => [
            styles.aiReflectionPill,
            isAiReflectionDisabled && styles.disabled,
            pressed && !isAiReflectionDisabled && styles.pressed,
          ]}
        >
          <View style={styles.magicStickFrame}>
            {isAnalyzing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MagicStick style={styles.magicStick} />
            )}
          </View>
          <Text
            numberOfLines={1}
            maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
            style={styles.aiReflectionText}
          >
            Get AI Reflection
          </Text>
        </Pressable>

        <Pressable
          onPress={handleDeletePress}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Delete"
        >
          {({ pressed }) => (
            <Text
              maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
              style={[styles.deleteText, pressed && styles.pressed]}
            >
              Delete
            </Text>
          )}
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: footerBottom + footerHeight + 16 },
        ]}
        bottomOffset={FOOTER_GAP + footerHeight + 8}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.entry}>
          <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}>
            {screenTitle}
          </Text>
          <TextInput
            autoFocus={!isEditMode}
            multiline
            scrollEnabled={false}
            value={entryText}
            onChangeText={setEntryText}
            placeholder="Describe your dream as you remember it..."
            placeholderTextColor="#8C8C8A"
            cursorColor={COLORS.brandYellow}
            selectionColor={COLORS.brandYellow}
            textAlignVertical="top"
            accessibilityLabel="Dream journal entry"
            style={styles.input}
          />
        </View>

        <DreamDetailsCard
          isExpanded={isDetailsExpanded}
          values={details}
          onToggleExpanded={setIsDetailsExpanded}
          onChipPress={handleChipPress}
          onTextChange={handleDetailTextChange}
        />
      </KeyboardAwareScrollView>

      <KeyboardStickyView
        offset={{ closed: 0, opened: insets.bottom }}
        style={[styles.footer, { bottom: footerBottom }]}
        onLayout={handleFooterLayout}
      >
        <ReflectionPromptsFooter
          prompts={DREAM_INSTRUCTIONS}
          isVisible={arePromptsVisible}
          onToggle={setArePromptsVisible}
        />
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 23.5,
  },
  aiReflectionPill: {
    height: 36,
    borderRadius: 50,
    backgroundColor: COLORS.brandYellow,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingLeft: 10,
    paddingRight: 15,
  },
  // Figma 3128:10009: 22×22 clip; the 33×31 vector sits at (2, -9).
  magicStickFrame: {
    width: 22,
    height: 22,
    overflow: "hidden",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  magicStick: {
    marginLeft: 2,
    marginTop: -9,
  },
  aiReflectionText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
  deleteText: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.32,
    color: "#8E8E93",
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.45,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  entry: {
    paddingHorizontal: 23,
    gap: 10,
    marginBottom: 37,
  },
  title: {
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#000000",
    includeFontPadding: false,
  },
  input: {
    minHeight: 26,
    padding: 0,
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#8C8C8A",
    includeFontPadding: false,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
