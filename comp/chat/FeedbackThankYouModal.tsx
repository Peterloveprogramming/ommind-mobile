import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Check from "@/assets/svg/chat/Check";
import { COLORS, FONTS } from "@/theme.js";

type FeedbackThankYouModalProps = {
  visible: boolean;
  onClose: () => void;
};

// Figma "Thank you for your feedback!" card (node 2636:9888)
const FeedbackThankYouModal = ({ visible, onClose }: FeedbackThankYouModalProps) => (
  <Modal
    transparent
    animationType="fade"
    statusBarTranslucent
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.container}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.card}>
        <View style={styles.checkCircle}>
          <Check />
        </View>
        <Text style={styles.title}>Thank you for your feedback!</Text>
        <Text style={styles.body}>
          Your input helps us improve.{"\n"}We appreciate your help! {"💛"}
        </Text>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.okButton, pressed && styles.okButtonPressed]}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text style={styles.okText}>OK</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 33,
  },
  card: {
    width: "100%",
    maxWidth: 327,
    alignItems: "center",
    gap: 9,
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "rgba(40, 40, 40, 0.8)",
  },
  checkCircle: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  title: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#FFFFFF",
    textAlign: "center",
  },
  body: {
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#FFFFFF",
    textAlign: "center",
  },
  okButton: {
    height: 26,
    paddingHorizontal: 15,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.brandYellow,
  },
  okButtonPressed: {
    opacity: 0.8,
  },
  okText: {
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
});

export default FeedbackThankYouModal;
