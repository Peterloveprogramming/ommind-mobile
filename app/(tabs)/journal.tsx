import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "@/theme.js";

type JournalTab = "dreams" | "awareness";

type JournalEntry = {
  id: string;
  day: string;
  month: string;
  time: string;
  title: string;
  preview: string;
};

const JOURNAL_COUNTS: Record<JournalTab, number> = {
  dreams: 3,
  awareness: 1,
};

const JOURNAL_ENTRIES: Record<JournalTab, JournalEntry[]> = {
  dreams: [
    {
      id: "dream-1",
      day: "03",
      month: "July",
      time: "23:14 PM",
      title: "Walking Through Lantern Fog",
      preview: "I remember a dim path, quiet footsteps, and a warm light following me...",
    },
  ],
  awareness: [
    {
      id: "awareness-1",
      day: "06",
      month: "July",
      time: "21:21 PM",
      title: "Softening into the Breath",
      preview: "During today’s meditation, I noticed how tightly I had been holding...",
    },
  ],
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
  const [activeTab, setActiveTab] = useState<JournalTab>("awareness");

  const activeEntries = useMemo(() => JOURNAL_ENTRIES[activeTab], [activeTab]);

  const handleEntryPress = (entry: JournalEntry) => {
    router.push({
      pathname: "/journal/write",
      params: { type: activeTab, title: entry.title },
    });
  };

  const handleStartWritingPress = () => {
    router.push({
      pathname: "/journal/write",
      params: { type: activeTab },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.tabRow}>
          {TAB_CONFIG.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
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
                      {JOURNAL_COUNTS[tab.key]}
                    </Text>
                  </View>
                </View>
                <View style={[styles.tabUnderline, isActive && styles.tabUnderlineActive]} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.listArea}>
          {activeEntries.map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() => handleEntryPress(entry)}
              style={({ pressed }) => [
                styles.entryRow,
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
            </Pressable>
          ))}
        </View>

        <View style={styles.ctaWrap}>
          <Pressable
            onPress={handleStartWritingPress}
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed,
            ]}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.ctaText}>Start Writing</Text>
          </Pressable>
        </View>
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
    paddingHorizontal: 18,
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
  entryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    paddingVertical: 4,
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
  ctaText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 16,
    color: "#FFFFFF",
  },
});
