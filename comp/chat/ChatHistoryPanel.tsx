import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const sampleHistory = [
  {
    id: "1",
    title: "Morning grounding",
    preview: "We talked about settling anxious thoughts before work.",
    timestamp: "Today",
  },
  {
    id: "2",
    title: "Sleep reset",
    preview: "Breathing pattern and a short evening routine.",
    timestamp: "Yesterday",
  },
  {
    id: "3",
    title: "Meditation follow-up",
    preview: "Questions after the guided meditation session.",
    timestamp: "Mar 18",
  },
];

type ChatHistoryPanelProps = {
  onClose: () => void;
};

const ChatHistoryPanel = ({ onClose }: ChatHistoryPanelProps) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const panelWidth = width * 0.75;

  return (
    <View style={[styles.panel, { width: panelWidth, paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Lhamo</Text>
          <Text style={styles.title}>Chat History</Text>
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>
        This page is ready for your real history data and item layout.
      </Text>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {sampleHistory.map((item) => (
          <TouchableOpacity key={item.id} style={styles.historyCard} activeOpacity={0.85}>
            <Text style={styles.historyTime}>{item.timestamp}</Text>
            <Text style={styles.historyTitle}>{item.title}</Text>
            <Text style={styles.historyPreview}>{item.preview}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    height: "100%",
    backgroundColor: "#F8F3E8",
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: {
      width: 4,
      height: 0,
    },
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 12,
    color: "#7C6F5E",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#E7DDCB",
  },
  closeButtonText: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    marginBottom: 20,
  },
  scrollContent: {
    gap: 14,
  },
  historyCard: {
    backgroundColor: "#FFFDF8",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9E1D2",
  },
  historyTime: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  historyPreview: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4B5563",
  },
});

export default ChatHistoryPanel;
