import ChatHistoryPanel from "@/comp/chat/ChatHistoryPanel";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function ChatHistoryScreen() {
  const router = useRouter();

  return (
    <View style={styles.overlay}>
      <ChatHistoryPanel onClose={() => router.back()} />
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
