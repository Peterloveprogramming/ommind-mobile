import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import useAwarenessLogs from "@/api/awarenessLogs/useAwarenessLogs";
import useDreamLogs from "@/api/dreamLogs/useDreamLogs";
import { AwarenessLogItem } from "@/api/awarenessLogs/types";
import { DreamLogItem } from "@/api/dreamLogs/types";
import JournalMoon from "@/assets/svg/journal/JournalMoon";
import JournalSun from "@/assets/svg/journal/JournalSun";
import SelectedCheck from "@/assets/svg/journal/SelectedCheck";
import TrashIcon from "@/assets/svg/journal/TrashIcon";
import ExportIcon from "@/assets/svg/journal/ExportIcon";
import PlusIcon from "@/assets/svg/journal/PlusIcon";
import { COLORS, FONTS } from "@/theme.js";

type JournalTab = "dreams" | "awareness";

type JournalEntry = {
  id: string;
  day: string;
  month: string;
  time: string;
  title: string;
  preview: string;
  content: string;
  dreamTime?: string | null;
  wakingFeeling?: string | null;
  recurrence?: string | null;
  recentLifeConnection?: string | null;
  stressLevel?: string | null;
  sleepQuality?: string | null;
  season?: string | null;
  bodySensationAfterWaking?: string | null;
  healthOrWellnessContext?: string | null;
};

// Figma "Journal" 2586:9040 (Awareness) / "Journal long press" 2571:8646
// (Dreams, selection mode). Pro copy 37GSSpgSU44KPNvLuVKAOw.
const JOURNAL_UI = {
  TOP_OFFSET: 15,          // status bar bottom (59) -> tabs top (74)
  GUTTER: 23,
  TAB_MAX_WIDTH: 180,
  TAB_ROW_PADDING: 16,     // keeps the two 180 tabs on-screen down to 360 wide
  SECTION_GAP: 20,         // tabs -> first entry, and between entries
  BOTTOM_SLOT_HEIGHT: 44,  // Start Writing (44) and the 36 action pills share a centre line
  BOTTOM_SLOT_GAP: 13,     // slot bottom -> top of the tab bar container
  TEXT_GREY: "#8C8C8A",
  TAB_INACTIVE: "#8E8E93",
  BADGE_INACTIVE_BG: "#E5E5EA",
  BADGE_INACTIVE_TEXT: "#636366",
  INDICATOR_BORDER: "#C4C4C4",
  BACKGROUND: "#FAFAFA",
} as const;

const MAX_FONT_SCALE = 1.2;

const FALLBACK_EMPTY_DATE = {
  day: "--",
  month: "Unknown",
  time: "--:--",
};

const getJournalEntryDateParts = (createdAt?: string | null) => {
  if (!createdAt) {
    return FALLBACK_EMPTY_DATE;
  }

  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) {
    return FALLBACK_EMPTY_DATE;
  }

  return {
    day: new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(createdDate),
    month: new Intl.DateTimeFormat("en-GB", { month: "long" }).format(createdDate),
    // Figma shows "09:30 AM".
    time: new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(createdDate),
  };
};

const createDreamTitle = (log?: string | null) => {
  const trimmedLog = log?.trim() ?? "";

  if (!trimmedLog) {
    return "Untitled Dream";
  }

  const title = trimmedLog.split(/\s+/).slice(0, 4).join(" ");
  return title.length > 28 ? `${title.slice(0, 28)}...` : title;
};

const createAwarenessTitle = (log?: string | null) => {
  const trimmedLog = log?.trim() ?? "";

  if (!trimmedLog) {
    return "Untitled Awareness";
  }

  const title = trimmedLog.split(/\s+/).slice(0, 4).join(" ");
  return title.length > 28 ? `${title.slice(0, 28)}...` : title;
};

const mapDreamLogToJournalEntry = (
  dreamLog: DreamLogItem
): JournalEntry => {
  const { day, month, time } = getJournalEntryDateParts(dreamLog.created_at);
  const logText = typeof dreamLog.log === "string" ? dreamLog.log : "";
  const title = createDreamTitle(logText);

  return {
    id: String(dreamLog.id ?? `${dreamLog.created_at ?? title}`),
    day,
    month,
    time,
    title,
    preview: logText || "No dream text saved yet.",
    content: logText,
    dreamTime: dreamLog.dream_time ?? null,
    wakingFeeling: dreamLog.waking_feeling ?? null,
    recurrence: dreamLog.recurrence ?? null,
    recentLifeConnection: dreamLog.recent_life_connection ?? null,
    stressLevel: dreamLog.stress_level ?? null,
    sleepQuality: dreamLog.sleep_quality ?? null,
    season: dreamLog.season ?? null,
    bodySensationAfterWaking: dreamLog.body_sensation_after_waking ?? null,
    healthOrWellnessContext: dreamLog.health_or_wellness_context ?? null,
  };
};

const mapAwarenessLogToJournalEntry = (
  awarenessLog: AwarenessLogItem
): JournalEntry => {
  const { day, month, time } = getJournalEntryDateParts(awarenessLog.created_at);
  const logText = typeof awarenessLog.log === "string" ? awarenessLog.log : "";
  const title = createAwarenessTitle(logText);

  return {
    id: String(awarenessLog.log_id ?? awarenessLog.id ?? `${awarenessLog.created_at ?? title}`),
    day,
    month,
    time,
    title,
    preview: logText || "No awareness text saved yet.",
    content: logText,
  };
};

const getDateLabelKey = (entry: JournalEntry) => `${entry.day} ${entry.month}`;

const TAB_CONFIG: { key: JournalTab; label: string }[] = [
  { key: "dreams", label: "Dreams" },
  { key: "awareness", label: "Awareness" },
];

const TabIcon = ({ tab, isActive }: { tab: JournalTab; isActive: boolean }) => {
  if (tab === "dreams") {
    return isActive ? (
      <JournalMoon />
    ) : (
      <JournalMoon fillColor={JOURNAL_UI.TAB_INACTIVE} strokeColor={JOURNAL_UI.TAB_INACTIVE} />
    );
  }

  return <JournalSun color={isActive ? "#000000" : JOURNAL_UI.TAB_INACTIVE} />;
};

const DREAM_JOURNAL_BACKGROUND = require("@/assets/images/journal/dream_background.png");
const AWARENESS_JOURNAL_BACKGROUND = require("@/assets/images/journal/awareness_background.png");
const CLOSE_BUTTON_IMAGE = require("@/assets/images/journal/close_button.png");
const MAX_SELECTED_ENTRIES = 3;

const Journal = () => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { activeTab: activeTabParam } = useLocalSearchParams<{
    activeTab?: JournalTab;
  }>();
  const [activeTab, setActiveTab] = useState<JournalTab>("dreams");
  const [isJournalPickerVisible, setIsJournalPickerVisible] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  // Natural width of each "07 / July" label, keyed by its text. The date
  // column uses the widest one so every divider lines up even when month
  // names differ in length ("May" vs "September").
  const [dateLabelWidths, setDateLabelWidths] = useState<Record<string, number>>({});
  const {
    dreamLogs,
    isLoading,
    isDeleting: isDeletingDreamLogs,
    // Reflection is disabled for now.
    // isAnalyzing: isAnalyzingDreamLogs,
    fetchDreamLogs,
    bulkDeleteDreamLogs,
    // analyzeDreamLogs,
  } = useDreamLogs();
  const {
    awarenessLogs,
    isLoading: isLoadingAwarenessLogs,
    isDeleting: isDeletingAwarenessLogs,
    // Reflection is disabled for now.
    // isAnalyzing: isAnalyzingAwarenessLogs,
    fetchAwarenessLogs,
    bulkDeleteAwarenessLogs,
    // analyzeAwarenessLogs,
  } = useAwarenessLogs();

  const dreamEntries = useMemo(
    () => dreamLogs.map(mapDreamLogToJournalEntry),
    [dreamLogs]
  );
  const awarenessEntries = useMemo(
    () => awarenessLogs.map(mapAwarenessLogToJournalEntry),
    [awarenessLogs]
  );

  const activeEntries = activeTab === "dreams" ? dreamEntries : awarenessEntries;

  const journalCounts = {
    dreams: dreamEntries.length,
    awareness: awarenessEntries.length,
  };

  const dateColumnWidth = activeEntries.reduce(
    (maxWidth, entry) => Math.max(maxWidth, dateLabelWidths[getDateLabelKey(entry)] ?? 0),
    0
  );

  useEffect(() => {
    if (activeTabParam === "dreams" || activeTabParam === "awareness") {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam]);

  const handleExitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedEntryIds([]);
  }, []);

  // Both lists load on focus so both tab badges show real counts.
  useFocusEffect(
    useCallback(() => {
      setIsJournalPickerVisible(false);
      handleExitSelectionMode();
      void Promise.all([fetchDreamLogs(), fetchAwarenessLogs()]);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  // Android back leaves selection mode instead of the screen.
  useFocusEffect(
    useCallback(() => {
      if (!isSelectionMode) {
        return;
      }

      const backSubscription = BackHandler.addEventListener("hardwareBackPress", () => {
        handleExitSelectionMode();
        return true;
      });

      return () => backSubscription.remove();
    }, [handleExitSelectionMode, isSelectionMode])
  );

  const toggleEntrySelection = (entryId: string) => {
    const nextIds = selectedEntryIds.includes(entryId)
      ? selectedEntryIds.filter((currentId) => currentId !== entryId)
      : selectedEntryIds.length >= MAX_SELECTED_ENTRIES
        ? selectedEntryIds
        : [...selectedEntryIds, entryId];

    if (nextIds.length === 0) {
      handleExitSelectionMode();
      return;
    }

    setSelectedEntryIds(nextIds);
  };

  const handleEntryPress = (entry: JournalEntry) => {
    if (isSelectionMode) {
      toggleEntrySelection(entry.id);
      return;
    }

    router.push({
      pathname: "/journal/write",
      params: {
        type: activeTab,
        title: entry.title,
        logId: entry.id,
        content: entry.content,
        ...(activeTab === "dreams"
          ? {
              dreamTime: entry.dreamTime ?? "",
              wakingFeeling: entry.wakingFeeling ?? "",
              recurrence: entry.recurrence ?? "",
              recentLifeConnection: entry.recentLifeConnection ?? "",
              stressLevel: entry.stressLevel ?? "",
              sleepQuality: entry.sleepQuality ?? "",
              season: entry.season ?? "",
              bodySensationAfterWaking: entry.bodySensationAfterWaking ?? "",
              healthOrWellnessContext: entry.healthOrWellnessContext ?? "",
            }
          : {}),
      },
    });
  };

  const handleEntryLongPress = (entry: JournalEntry) => {
    if (isSelectionMode) {
      toggleEntrySelection(entry.id);
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSelectionMode(true);
    setSelectedEntryIds([entry.id]);
  };

  const handleTabPress = (tab: JournalTab) => {
    setActiveTab(tab);
    handleExitSelectionMode();
  };

  const handleDateLabelLayout = (key: string, event: LayoutChangeEvent) => {
    const width = Math.ceil(event.nativeEvent.layout.width);
    setDateLabelWidths((currentWidths) =>
      currentWidths[key] === width ? currentWidths : { ...currentWidths, [key]: width }
    );
  };

  const deleteSelectedEntries = async () => {
    if (activeTab === "dreams") {
      const isDeleted = await bulkDeleteDreamLogs({ log_ids: selectedEntryIds });
      if (!isDeleted) {
        return;
      }

      await fetchDreamLogs();
    } else {
      const isDeleted = await bulkDeleteAwarenessLogs({ log_ids: selectedEntryIds });
      if (!isDeleted) {
        return;
      }

      await fetchAwarenessLogs();
    }

    handleExitSelectionMode();
  };

  const handleDeleteSelectedPress = () => {
    if (selectedEntryIds.length === 0) {
      return;
    }

    const count = selectedEntryIds.length;
    const noun = activeTab === "dreams" ? "dream" : "awareness";

    Alert.alert(
      count === 1 ? `Delete this ${noun} log?` : `Delete ${count} ${noun} logs?`,
      "This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void deleteSelectedEntries();
          },
        },
      ]
    );
  };

  // Reflection is disabled for now (the Reflect pill from Figma 2571:8759 is
  // intentionally not shown).
  // const handleReflectPress = async () => {
  //   if (isAnalyzingDreamLogs || isAnalyzingAwarenessLogs || selectedEntryIds.length === 0) {
  //     return;
  //   }
  //
  //   const response =
  //     activeTab === "dreams"
  //       ? await analyzeDreamLogs({ logs_id: selectedEntryIds })
  //       : await analyzeAwarenessLogs({ logs_id: selectedEntryIds });
  //   console.log(`analyze ${activeTab} response:`, response);
  //
  //   const sessionId =
  //     typeof response?.data?.session_id === "string" ? response.data.session_id : null;
  //
  //   if (!sessionId) {
  //     return;
  //   }
  //
  //   handleExitSelectionMode();
  //   router.push({
  //     pathname: "/chat/new_index",
  //     params: {
  //       session_id: sessionId,
  //       existing_chat: "true",
  //     },
  //   });
  // };

  const handleStartWritingPress = () => {
    setIsJournalPickerVisible(true);
  };

  const handleCreateJournalPress = (type: JournalTab) => {
    setIsJournalPickerVisible(false);
    router.push({
      pathname: "/journal/write",
      params: { type },
    });
  };

  const isDeleting = isDeletingDreamLogs || isDeletingAwarenessLogs;
  const isDeleteDisabled = selectedEntryIds.length === 0 || isDeleting;
  const isActiveTabLoading = activeTab === "dreams" ? isLoading : isLoadingAwarenessLogs;
  const bottomSlotBottom = tabBarHeight + JOURNAL_UI.BOTTOM_SLOT_GAP;

  const renderEntry = ({ item: entry }: { item: JournalEntry }) => {
    const isSelected = selectedEntryIds.includes(entry.id);

    return (
      <Pressable
        onLongPress={() => handleEntryLongPress(entry)}
        onPress={() => handleEntryPress(entry)}
        accessibilityRole={isSelectionMode ? "checkbox" : "button"}
        accessibilityState={isSelectionMode ? { checked: isSelected } : undefined}
        accessibilityLabel={`${entry.day} ${entry.month}, ${entry.time}, ${entry.title}`}
        accessibilityHint={isSelectionMode ? undefined : "Long press to select"}
        style={({ pressed }) => [styles.entryRow, pressed && styles.entryRowPressed]}
      >
        <View style={{ minWidth: dateColumnWidth }}>
          <View
            onLayout={(event) => handleDateLabelLayout(getDateLabelKey(entry), event)}
            style={styles.dateLabel}
          >
            <Text style={styles.dayText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {entry.day}
            </Text>
            <Text style={styles.monthText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {entry.month}
            </Text>
          </View>
        </View>

        <View style={styles.entryDivider} />

        <View style={styles.entryContent}>
          <Text style={styles.timeText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {entry.time}
          </Text>
          <Text numberOfLines={1} style={styles.entryTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {entry.title}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.previewText}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {entry.preview}
          </Text>
        </View>

        {isSelectionMode ? (
          <View style={styles.selectionIndicatorWrap}>
            {isSelected ? <SelectedCheck /> : <View style={styles.selectionIndicator} />}
          </View>
        ) : null}
      </Pressable>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + JOURNAL_UI.TOP_OFFSET }]}>
      <View style={styles.tabRow} accessibilityRole="tablist">
        {TAB_CONFIG.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label}, ${journalCounts[tab.key]} entries`}
              style={styles.tabButton}
            >
              <View style={styles.tabLabelRow}>
                <TabIcon tab={tab.key} isActive={isActive} />
                <Text
                  numberOfLines={1}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                >
                  {tab.label}
                </Text>
                <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                  <Text
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                    style={[styles.countText, isActive && styles.countTextActive]}
                  >
                    {journalCounts[tab.key]}
                  </Text>
                </View>
              </View>
              <View style={[styles.tabUnderline, isActive && styles.tabUnderlineActive]} />
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={activeEntries}
        keyExtractor={(entry) => entry.id}
        renderItem={renderEntry}
        extraData={[isSelectionMode, selectedEntryIds, dateColumnWidth]}
        ItemSeparatorComponent={EntrySeparator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom:
              bottomSlotBottom + JOURNAL_UI.BOTTOM_SLOT_HEIGHT + JOURNAL_UI.SECTION_GAP,
          },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {isActiveTabLoading ? (
              <ActivityIndicator color={JOURNAL_UI.TEXT_GREY} />
            ) : (
              <>
                <Text style={styles.emptyStateTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {activeTab === "dreams" ? "No dream logs yet" : "No awareness logs yet"}
                </Text>
                <Text style={styles.emptyStateText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {activeTab === "dreams"
                    ? "Your saved dreams will appear here once you start writing."
                    : "Your saved awareness logs will appear here once you start writing."}
                </Text>
              </>
            )}
          </View>
        }
      />

      <View style={[styles.bottomSlot, { bottom: bottomSlotBottom }]}>
        {isSelectionMode ? (
          <View style={styles.selectionActionsRow}>
            {/* Reflection is disabled for now: no Reflect pill here. */}
            <Pressable
              onPress={handleDeleteSelectedPress}
              disabled={isDeleteDisabled}
              accessibilityRole="button"
              accessibilityState={{ disabled: isDeleteDisabled, busy: isDeleting }}
              style={({ pressed }) => [
                styles.selectionActionButton,
                isDeleteDisabled && styles.selectionActionButtonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              <View style={styles.selectionActionIcon}>
                {isDeleting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <TrashIcon />}
              </View>
              <Text style={styles.selectionActionText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Delete
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.selectionActionButton, pressed && styles.buttonPressed]}
            >
              <View style={styles.selectionActionIcon}>
                <ExportIcon />
              </View>
              <Text style={styles.selectionActionText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Export
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handleStartWritingPress}
            accessibilityRole="button"
            style={({ pressed }) => [styles.ctaButton, pressed && styles.buttonPressed]}
          >
            <View style={styles.ctaIcon}>
              <PlusIcon />
            </View>
            <Text style={styles.ctaText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Start Writing
            </Text>
          </Pressable>
        )}
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={isJournalPickerVisible}
        onRequestClose={() => setIsJournalPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsJournalPickerVisible(false)}
          />

          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.journalPickerRow}>
              <Pressable
                onPress={() => handleCreateJournalPress("dreams")}
                style={({ pressed }) => [styles.journalPickerCardWrap, pressed && styles.cardPressed]}
              >
                <ImageBackground
                  source={DREAM_JOURNAL_BACKGROUND}
                  style={styles.journalPickerCard}
                  imageStyle={styles.journalPickerCardImage}
                >
                  <Ionicons name="moon" size={24} color="#FFFFFF" />
                  {/* <Text style={styles.journalPickerText}>Dream{"\n"}Journal</Text> */}
                </ImageBackground>
              </Pressable>

              <Pressable
                onPress={() => handleCreateJournalPress("awareness")}
                style={({ pressed }) => [styles.journalPickerCardWrap, pressed && styles.cardPressed]}
              >
                <ImageBackground
                  source={AWARENESS_JOURNAL_BACKGROUND}
                  style={styles.journalPickerCard}
                  imageStyle={styles.journalPickerCardImage}
                >
                  <Ionicons name="sunny-outline" size={24} color="#FFFFFF" />
                  {/* <Text style={styles.journalPickerText}>Awareness{"\n"}Journal</Text> */}
                </ImageBackground>
              </Pressable>
            </View>

            <Pressable
              onPress={() => setIsJournalPickerVisible(false)}
              style={({ pressed }) => [styles.closeButtonWrap, pressed && styles.cardPressed]}
            >
              <Image source={CLOSE_BUTTON_IMAGE} style={styles.closeButtonImage} />
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const EntrySeparator = () => <View style={styles.entrySeparator} />;

export default Journal;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: JOURNAL_UI.BACKGROUND,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: JOURNAL_UI.TAB_ROW_PADDING,
  },
  tabButton: {
    flex: 1,
    maxWidth: JOURNAL_UI.TAB_MAX_WIDTH,
    alignItems: "center",
    paddingTop: 6,
    paddingBottom: 5,
  },
  tabLabelRow: {
    maxWidth: "100%",
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  tabLabel: {
    flexShrink: 1,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.32,
    color: JOURNAL_UI.TAB_INACTIVE,
    includeFontPadding: false,
  },
  tabLabelActive: {
    color: "#000000",
  },
  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: JOURNAL_UI.BADGE_INACTIVE_BG,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countBadgeActive: {
    backgroundColor: "#000000",
  },
  countText: {
    fontFamily: FONTS.inter,
    fontSize: 12,
    lineHeight: 16,
    color: JOURNAL_UI.BADGE_INACTIVE_TEXT,
    includeFontPadding: false,
  },
  countTextActive: {
    color: "#FFFFFF",
  },
  tabUnderline: {
    alignSelf: "stretch",
    marginTop: 7,
    height: 2,
    backgroundColor: "transparent",
  },
  tabUnderlineActive: {
    backgroundColor: "#000000",
  },
  listContent: {
    flexGrow: 1,
    paddingTop: JOURNAL_UI.SECTION_GAP,
  },
  entrySeparator: {
    height: JOURNAL_UI.SECTION_GAP,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: JOURNAL_UI.GUTTER,
  },
  emptyStateTitle: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 18,
    lineHeight: 22,
    color: "#000000",
    textAlign: "center",
    includeFontPadding: false,
  },
  emptyStateText: {
    marginTop: 8,
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 14,
    lineHeight: 20,
    color: JOURNAL_UI.TEXT_GREY,
    textAlign: "center",
    includeFontPadding: false,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: JOURNAL_UI.GUTTER,
  },
  entryRowPressed: {
    opacity: 0.6,
  },
  dateLabel: {
    alignSelf: "flex-start",
    gap: 5,
  },
  dayText: {
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 20,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#000000",
    includeFontPadding: false,
  },
  monthText: {
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: JOURNAL_UI.TEXT_GREY,
    includeFontPadding: false,
  },
  entryDivider: {
    alignSelf: "stretch",
    width: 1,
    backgroundColor: JOURNAL_UI.TEXT_GREY,
  },
  entryContent: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  timeText: {
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: JOURNAL_UI.TEXT_GREY,
    includeFontPadding: false,
  },
  entryTitle: {
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#000000",
    includeFontPadding: false,
  },
  previewText: {
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: JOURNAL_UI.TEXT_GREY,
    includeFontPadding: false,
  },
  selectionIndicatorWrap: {
    alignSelf: "stretch",
    justifyContent: "center",
  },
  selectionIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: JOURNAL_UI.INDICATOR_BORDER,
  },
  bottomSlot: {
    position: "absolute",
    left: 0,
    right: 0,
    height: JOURNAL_UI.BOTTOM_SLOT_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: JOURNAL_UI.GUTTER,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  ctaButton: {
    height: 44,
    borderRadius: 25,
    backgroundColor: COLORS.brandYellow,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  ctaIcon: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.408,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
  selectionActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 31,
  },
  selectionActionButton: {
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.brandYellow,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingLeft: 10,
    paddingRight: 15,
  },
  selectionActionButtonDisabled: {
    opacity: 0.6,
  },
  selectionActionIcon: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionActionText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(16, 16, 16, 0.34)",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: "#F7F7F4",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 12,
    paddingHorizontal: 18,
    paddingBottom: 28,
    alignItems: "center",
  },
  modalHandle: {
    width: 76,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#B6B6BA",
    marginBottom: 22,
  },
  journalPickerRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  journalPickerCardWrap: {
    flex: 1,
  },
  journalPickerCard: {
    minHeight: 138,
    borderRadius: 28,
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  journalPickerCardImage: {
    borderRadius: 28,
  },
  journalPickerText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 18,
    lineHeight: 23,
    color: "#FFFFFF",
  },
  closeButtonWrap: {
    marginTop: 18,
  },
  closeButtonImage: {
    width: 72,
    height: 72,
    resizeMode: "contain",
  },
  cardPressed: {
    opacity: 0.86,
  },
});
