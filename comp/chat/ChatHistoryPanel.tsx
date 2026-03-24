import { LambdaResult } from "@/api/types";
import useChatHistory from "@/services/useChatHistory";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ChatHistoryPanelProps = {
  onClose: () => void;
};

const ChatHistoryPanel = ({ onClose }: ChatHistoryPanelProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const panelWidth = width * 0.75;
  const { chatHistories, isLoading, error, fetchChatHistories } = useChatHistory();

  useEffect(() => {
    void fetchChatHistories();
  }, []);

  const handleHistoryPress = (historyItem: LambdaResult.ChatHistoryItem) => {
    router.replace({
      pathname: "/chat",
      params: {
        session_id: historyItem.session_id,
        existing_chat: "true",
      },
    });
  };

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
        Your recent Lhamo sessions are loaded from the API.
      </Text>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="small" color="#7C6F5E" />
            <Text style={styles.stateText}>Loading chat history...</Text>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Couldn't load history</Text>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity
              onPress={() => {
                void fetchChatHistories();
              }}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!isLoading && !error && chatHistories.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>No chat history yet</Text>
            <Text style={styles.stateText}>Your completed sessions will appear here.</Text>
          </View>
        ) : null}

        {!isLoading &&
          !error &&
          chatHistories.map((item) => (
            <TouchableOpacity
              key={item.session_id}
              style={styles.historyCard}
              activeOpacity={0.85}
              onPress={() => handleHistoryPress(item)}
            >
              <Text style={styles.historyTime}>Session</Text>
              <Text style={styles.historyTitle}>{item.title}</Text>
              <Text style={styles.historyPreview}>{item.session_id}</Text>
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
  stateCard: {
    backgroundColor: "#FFFDF8",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9E1D2",
    alignItems: "center",
    gap: 10,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4B5563",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#E7DDCB",
  },
  retryButtonText: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default ChatHistoryPanel;
