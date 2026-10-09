import ChatHistoryPanel from "@/comp/chat/ChatHistoryPanel";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function ChatHistoryScreen() {
  const router = useRouter();
  const { active_session_id } = useLocalSearchParams<{ active_session_id?: string | string[] }>();
  const activeSessionId = Array.isArray(active_session_id) ? active_session_id[0] : active_session_id;

  return (
    <View style={styles.overlay}>
      <ChatHistoryPanel onClose={() => router.back()} activeSessionId={activeSessionId} />
      <Pressable style={styles.backdrop} onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
  },
  backdrop: {
    flex: 1,
  },
});
