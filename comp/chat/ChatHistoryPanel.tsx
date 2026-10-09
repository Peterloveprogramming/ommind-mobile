import NewChatButton from "@/assets/svg/chat/NewChatButton";
import { ChatHistoryItem } from "@/api/chatHistory/types";
import useChatHistory from "@/api/chatHistory/useChatHistory";
import { FONTS } from "@/theme.js";
import { navigateToNewChat } from "@/utils/helper";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Figma drawer is 287pt wide on a 375pt screen.
const PANEL_WIDTH_RATIO = 287 / 375;
const PANEL_MAX_WIDTH = 360;

type ChatHistoryPanelProps = {
  onClose: () => void;
  activeSessionId?: string | null;
};

const ChatHistoryPanel = ({ onClose, activeSessionId }: ChatHistoryPanelProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(Math.round(width * PANEL_WIDTH_RATIO), PANEL_MAX_WIDTH);
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
        withinSevenDays: [] as ChatHistoryItem[],
        earlier: [] as ChatHistoryItem[],
      }
    );
  }, [chatHistories]);

  const handleHistoryPress = (historyItem: ChatHistoryItem) => {
    onClose();
    if (historyItem.session_id === activeSessionId) {
      return;
    }
    router.replace({
      pathname: "/chat/new_index",
      params: {
        session_id: historyItem.session_id,
        existing_chat: "true",
      },
    });
  };

  const handleNewChatPress = () => {
    onClose();
    navigateToNewChat(router, "replace");
  };

  const renderHistorySection = (title: string, historyItems: ChatHistoryItem[]) => {
    if (historyItems.length === 0) {
      return null;
    }

    return (
      <View style={styles.section} key={title}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {historyItems.map((item) => {
          const isActive = item.session_id === activeSessionId;
          return (
            <Pressable
              key={item.session_id}
              onPress={() => handleHistoryPress(item)}
              style={({ pressed }) => [
                styles.historyRow,
                (isActive || pressed) && styles.historyRowHighlighted,
              ]}
            >
              <Text style={styles.historyTitle} numberOfLines={1}>
                {item.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.panel, { width: panelWidth, paddingTop: insets.top + 12 }]}>
      <TouchableOpacity
        style={styles.newChatButton}
        activeOpacity={0.7}
        onPress={handleNewChatPress}
        accessibilityRole="button"
        accessibilityLabel="New Chat"
      >
        <NewChatButton />
        <Text style={styles.newChatText}>New Chat</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="small" color="#8E8E93" />
          </View>
        ) : null}

        {!isLoading && error ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>Couldn&apos;t load chat history.</Text>
            <TouchableOpacity
              onPress={() => {
                void fetchChatHistories();
              }}
              hitSlop={8}
            >
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!isLoading && !error && chatHistories.length === 0 ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>No chat history yet.</Text>
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

// Android adds extra font padding above/below glyphs; strip it so rows match iOS.
const textReset = Platform.select({
  android: { includeFontPadding: false, textAlignVertical: "center" as const },
  default: {},
});

const styles = StyleSheet.create({
  panel: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 7,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 2,
      height: 0,
    },
    elevation: 8,
  },
  newChatButton: {
    height: 34,
    borderRadius: 5,
    backgroundColor: "rgba(217, 217, 217, 0.5)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  newChatText: {
    ...textReset,
    fontFamily: FONTS.figtreeBold,
    fontSize: 15,
    letterSpacing: -0.24,
    color: "#383838",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 21,
    gap: 7,
  },
  section: {},
  sectionTitle: {
    ...textReset,
    fontFamily: FONTS.inter,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#8E8E93",
    paddingHorizontal: 6,
  },
  historyRow: {
    height: 34,
    borderRadius: 5,
    paddingHorizontal: 7,
    justifyContent: "center",
  },
  historyRowHighlighted: {
    backgroundColor: "rgba(217, 217, 217, 0.5)",
  },
  historyTitle: {
    ...textReset,
    fontFamily: FONTS.inter,
    fontSize: 15,
    letterSpacing: -0.24,
    color: "#383838",
  },
  stateContainer: {
    paddingTop: 8,
    paddingHorizontal: 7,
    gap: 8,
    alignItems: "flex-start",
  },
  stateText: {
    ...textReset,
    fontFamily: FONTS.inter,
    fontSize: 15,
    letterSpacing: -0.24,
    color: "#8E8E93",
  },
  retryText: {
    ...textReset,
    fontFamily: FONTS.figtreeBold,
    fontSize: 15,
    letterSpacing: -0.24,
    color: "#383838",
  },
});

export default ChatHistoryPanel;
