import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useAwarenessLogs from "@/services/useAwarenessLogs";
import useDreamLogs from "@/services/useDreamLogs";
import { LambdaResult } from "@/api/types";
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
};

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
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
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
  dreamLog: LambdaResult.DreamLogItem
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
  };
};

const mapAwarenessLogToJournalEntry = (
  awarenessLog: LambdaResult.AwarenessLogItem
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

const TAB_CONFIG: Array<{
  key: JournalTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: "dreams", label: "Dreams", icon: "moon" },
  { key: "awareness", label: "Awareness", icon: "sunny-outline" },
];

const Journal = () => {
  const [activeTab, setActiveTab] = useState<JournalTab>("dreams");
  const [isStartingWriting, setIsStartingWriting] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  const startWritingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    dreamLogs,
    isLoading,
    isDeleting: isDeletingDreamLogs,
    fetchDreamLogs,
    bulkDeleteDreamLogs,
  } = useDreamLogs();
  const {
    awarenessLogs,
    isLoading: isLoadingAwarenessLogs,
    isDeleting: isDeletingAwarenessLogs,
    fetchAwarenessLogs,
    bulkDeleteAwarenessLogs,
  } = useAwarenessLogs();

  const dreamEntries = useMemo(
    () => dreamLogs.map(mapDreamLogToJournalEntry),
    [dreamLogs]
  );
  const awarenessEntries = useMemo(
    () => awarenessLogs.map(mapAwarenessLogToJournalEntry),
    [awarenessLogs]
  );

  const activeEntries = useMemo(() => {
    if (activeTab === "dreams") {
      return dreamEntries;
    }

    return awarenessEntries;
  }, [activeTab, awarenessEntries, dreamEntries]);

  const journalCounts = useMemo(
    () => ({
      dreams: dreamEntries.length,
      awareness: awarenessEntries.length,
    }),
    [awarenessEntries.length, dreamEntries.length]
  );

  useFocusEffect(
    useCallback(() => {
      setIsStartingWriting(false);

      const loadJournalLogs = async () => {
        if (activeTab === "dreams") {
          const dreamLogs = await fetchDreamLogs();
          console.log("dream logs:", dreamLogs);
          return;
        }

        const awarenessLogs = await fetchAwarenessLogs();
        console.log("awareness logs:", awarenessLogs);
      };

      void loadJournalLogs();

      return () => {
        if (startWritingTimeoutRef.current) {
          clearTimeout(startWritingTimeoutRef.current);
          startWritingTimeoutRef.current = null;
        }
      };
    }, [activeTab])
  );

  const handleEntryPress = (entry: JournalEntry) => {
    if (isSelectionMode) {
      setSelectedEntryIds((currentIds) =>
        currentIds.includes(entry.id)
          ? currentIds.filter((currentId) => currentId !== entry.id)
          : [...currentIds, entry.id]
      );
      return;
    }

    router.push({
      pathname: "/journal/write",
      params: {
        type: activeTab,
        title: entry.title,
        logId: entry.id,
        content: entry.content,
      },
    });
  };

  const handleEntryLongPress = (entry: JournalEntry) => {
    setIsSelectionMode(true);
    setSelectedEntryIds((currentIds) =>
      currentIds.includes(entry.id) ? currentIds : [...currentIds, entry.id]
    );
  };

  const handleTabPress = (tab: JournalTab) => {
    setActiveTab(tab);
    setIsSelectionMode(false);
    setSelectedEntryIds([]);
  };

  const handleExitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedEntryIds([]);
  };

  const handleDeleteSelectedPress = async () => {
    if (selectedEntryIds.length === 0) {
      return;
    }

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

  const handleStartWritingPress = () => {
    if (isStartingWriting) {
      return;
    }

    setIsStartingWriting(true);
    startWritingTimeoutRef.current = setTimeout(() => {
      setIsStartingWriting(false);
      startWritingTimeoutRef.current = null;
    }, 1500);

    router.push({
      pathname: "/journal/write",
      params: { type: activeTab },
    });
  };

  const isDeleteDisabled =
    selectedEntryIds.length === 0 || isDeletingDreamLogs || isDeletingAwarenessLogs;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.tabRow}>
          {TAB_CONFIG.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <Pressable
                key={tab.key}
                onPress={() => handleTabPress(tab.key)}
                style={styles.tabButton}
              >
                <View style={styles.tabLabelRow}>
                  <Ionicons
                    name={tab.icon}
                    size={18}
                    color={isActive ? "#151515" : "#A8A8AF"}
                  />
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                  <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                    <Text
                      style={[
                        styles.countText,
                        isActive && styles.countTextActive,
                      ]}
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

        <View style={styles.listArea}>
          {activeEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>
                {activeTab === "dreams"
                  ? isLoading
                    ? "Loading dream logs..."
                    : "No dream logs yet"
                  : isLoadingAwarenessLogs
                    ? "Loading awareness logs..."
                    : "No awareness logs yet"}
              </Text>
              <Text style={styles.emptyStateText}>
                {activeTab === "dreams"
                  ? "Your saved dreams will appear here once you start writing."
                  : "Your saved awareness logs will appear here once you start writing."}
              </Text>
            </View>
          ) : (
            activeEntries.map((entry) => (
              <Pressable
                key={entry.id}
                onLongPress={() => handleEntryLongPress(entry)}
                onPress={() => handleEntryPress(entry)}
                style={({ pressed }) => [
                  styles.entryRow,
                  isSelectionMode && styles.entryRowSelectionMode,
                  pressed && styles.entryRowPressed,
                ]}
              >
                <View style={styles.dateColumn}>
                  <Text style={styles.dayText}>{entry.day}</Text>
                  <Text style={styles.monthText}>{entry.month}</Text>
                </View>

                <View style={styles.entryDivider} />

                <View style={styles.entryContent}>
                  <Text style={styles.timeText}>{entry.time}</Text>
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.previewText}>
                    {entry.preview}
                  </Text>
                </View>

                {isSelectionMode ? (
                  <View
                    style={[
                      styles.selectionIndicator,
                      selectedEntryIds.includes(entry.id) && styles.selectionIndicatorActive,
                    ]}
                  >
                    {selectedEntryIds.includes(entry.id) ? (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    ) : null}
                  </View>
                ) : null}
              </Pressable>
            ))
          )}
        </View>

        {isSelectionMode ? (
          <View style={styles.selectionActionsWrap}>


            <View style={styles.selectionActionsRow}>
              <Pressable style={({ pressed }) => [styles.selectionActionButton, pressed && styles.selectionActionButtonPressed]}>
                <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
                <Text style={styles.selectionActionText}>Reflect</Text>
              </Pressable>

              <Pressable
                onPress={handleDeleteSelectedPress}
                disabled={isDeleteDisabled}
                style={({ pressed }) => [
                  styles.selectionActionButton,
                  isDeleteDisabled && styles.selectionActionButtonDisabled,
                  pressed && styles.selectionActionButtonPressed,
                ]}
              >
                {isDeletingDreamLogs || isDeletingAwarenessLogs ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                )}
                <Text style={styles.selectionActionText}>Delete</Text>
              </Pressable>

              <Pressable style={({ pressed }) => [styles.selectionActionButton, pressed && styles.selectionActionButtonPressed]}>
                <Ionicons name="document-outline" size={18} color="#FFFFFF" />
                <Text style={styles.selectionActionText}>Export</Text>
              </Pressable>
            </View>
            <Pressable onPress={handleExitSelectionMode} style={styles.selectionModeExit}>
              <Text style={styles.selectionModeExitText}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.ctaWrap}>
            <Pressable
              onPress={handleStartWritingPress}
              disabled={isStartingWriting}
              style={({ pressed }) => [
                styles.ctaButton,
                isStartingWriting && styles.ctaButtonDisabled,
                pressed && styles.ctaButtonPressed,
              ]}
            >
              {isStartingWriting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                  <Text style={styles.ctaText}>Start Writing</Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Journal;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding:30,
    backgroundColor: "#FBFBF8",
  },
  container: {
    flex: 1,
    backgroundColor: "#FBFBF8",
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  tabRow: {
    flexDirection: "row",
    gap: 24,
  },
  tabButton: {
    flex: 1,
  },
  tabLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  tabLabel: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 17,
    color: "#A8A8AF",
  },
  tabLabelActive: {
    color: "#171717",
  },
  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ECECF0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
  },
  countBadgeActive: {
    backgroundColor: "#0F0F10",
  },
  countText: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 12,
    color: "#8C8C92",
  },
  countTextActive: {
    color: "#FFFFFF",
  },
  tabUnderline: {
    marginTop: 12,
    height: 2,
    backgroundColor: "transparent",
    borderRadius: 999,
  },
  tabUnderlineActive: {
    backgroundColor: "#191919",
  },
  listArea: {
    flex: 1,
    paddingTop: 18,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 18,
    color: "#171717",
    textAlign: "center",
  },
  emptyStateText: {
    marginTop: 8,
    fontFamily: FONTS.inter,
    fontSize: 14,
    lineHeight: 20,
    color: "#85858B",
    textAlign: "center",
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    paddingVertical: 4,
  },
  entryRowSelectionMode: {
    alignItems: "center",
    paddingRight: 8,
  },
  entryRowPressed: {
    opacity: 0.72,
  },
  dateColumn: {
    width: 40,
    alignItems: "center",
  },
  dayText: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 22,
    lineHeight: 26,
    color: "#161616",
  },
  monthText: {
    marginTop: 2,
    fontFamily: FONTS.inter,
    fontSize: 12,
    color: "#A8A8AF",
  },
  entryDivider: {
    width: 1,
    height: 64,
    backgroundColor: "#D3D3D8",
    marginLeft: 12,
    marginRight: 12,
  },
  entryContent: {
    flex: 1,
    paddingTop: 2,
  },
  timeText: {
    fontFamily: FONTS.inter,
    fontSize: 12,
    color: "#9B9BA2",
  },
  entryTitle: {
    marginTop: 4,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 17,
    color: "#171717",
  },
  previewText: {
    marginTop: 4,
    fontFamily: FONTS.inter,
    fontSize: 14,
    lineHeight: 20,
    color: "#85858B",
  },
  selectionIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#CBCBD1",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    marginTop: 10,
    backgroundColor: "#FFFFFF",
  },
  selectionIndicatorActive: {
    backgroundColor: COLORS.brandYellow,
    borderColor: COLORS.brandYellow,
  },
  ctaWrap: {
    paddingBottom: 118,
    paddingTop: 12,
  },
  ctaButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.brandYellow,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaButtonPressed: {
    opacity: 0.82,
  },
  ctaButtonDisabled: {
    opacity: 0.82,
  },
  ctaText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 16,
    color: "#FFFFFF",
  },
  selectionActionsWrap: {
    paddingTop: 12,
    paddingBottom: 118,
  },
  selectionModeExit: {
    alignSelf: "flex-end",
    marginRight:10,
    // paddingVertical: 6,
    // paddingHorizontal: 4,
    marginTop:10,
    marginBottom: 10,
  },
  selectionModeExitText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 14,
    color: "#717178",
  },
  selectionActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    // borderWidth:1,
    width:"100%",
  },
  selectionActionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: COLORS.brandYellow,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  selectionActionButtonPressed: {
    opacity: 0.82,
  },
  selectionActionButtonDisabled: {
    opacity: 0.6,
  },
  selectionActionText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 16,
    color: "#FFFFFF",
  },
});
