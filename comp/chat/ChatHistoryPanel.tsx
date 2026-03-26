import { LambdaResult } from "@/api/types";
import BaseButton from "@/comp/base/BaseButton";
import useChatHistory from "@/services/useChatHistory";
import { generateUniqueId } from "@/utils/helper";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
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

  const groupedChatHistories = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const sortedHistories = [...chatHistories].sort((firstItem, secondItem) => {
      const firstTime = firstItem.last_message_at ? new Date(firstItem.last_message_at).getTime() : 0;
      const secondTime = secondItem.last_message_at ? new Date(secondItem.last_message_at).getTime() : 0;
      const normalizedFirstTime = Number.isNaN(firstTime) ? 0 : firstTime;
      const normalizedSecondTime = Number.isNaN(secondTime) ? 0 : secondTime;
      return normalizedSecondTime - normalizedFirstTime;
    });

    return sortedHistories.reduce(
      (groups, historyItem) => {
        const lastMessageAt = historyItem.last_message_at ? new Date(historyItem.last_message_at) : null;
        const isWithinSevenDays =
          lastMessageAt !== null &&
          !Number.isNaN(lastMessageAt.getTime()) &&
          lastMessageAt >= sevenDaysAgo;

        if (isWithinSevenDays) {
          groups.withinSevenDays.push(historyItem);
        } else {
          groups.earlier.push(historyItem);
        }

        return groups;
      },
      {
        withinSevenDays: [] as LambdaResult.ChatHistoryItem[],
        earlier: [] as LambdaResult.ChatHistoryItem[],
      }
    );
  }, [chatHistories]);

  const handleHistoryPress = (historyItem: LambdaResult.ChatHistoryItem) => {
    onClose();
    router.replace({
      pathname: "/chat",
      params: {
        session_id: historyItem.session_id,
        existing_chat: "true",
      },
    });
  };

  const handleNewChatPress = () => {
    onClose();
    router.replace({
      pathname: "/chat",
      params: {
        session_id: generateUniqueId(),
        existing_chat: "false",
      },
    });
  };

  const renderHistorySection = (
    title: string,
    historyItems: LambdaResult.ChatHistoryItem[]
  ) => (
    <View style={styles.section} key={title}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {historyItems.length === 0 ? (
        <Text style={styles.emptySectionText}>No chats in this section.</Text>
      ) : (
        historyItems.map((item) => (
          <TouchableOpacity
            key={item.session_id}
            style={styles.historyCard}
            activeOpacity={0.85}
            onPress={() => handleHistoryPress(item)}
          >
            <Text style={styles.historyTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

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

      <BaseButton
        text="New chat"
        onPress={handleNewChatPress}
        height={52}
        useIcon={false}
        isLoading={false}
        style={styles.newChatButton}
      />

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

        {!isLoading && !error && chatHistories.length > 0 ? (
          <>
            {renderHistorySection("Within 7 days", groupedChatHistories.withinSevenDays)}
            {renderHistorySection("Earlier", groupedChatHistories.earlier)}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    height: "100%",
    backgroundColor: "#FFFFFF",
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
  newChatButton: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  newChatButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7C6F5E",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  emptySectionText: {
    fontSize: 14,
    color: "#6B7280",
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
