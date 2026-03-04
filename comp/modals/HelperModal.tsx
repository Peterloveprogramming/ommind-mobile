import React from "react";
import { Linking, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type HelperModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  actionLabel?: string;
  actionUrl?: string;
};

const HelperModal = ({
  visible,
  title,
  message,
  onClose,
  actionLabel,
  actionUrl,
}: HelperModalProps) => {
  const handleActionPress = async () => {
    if (!actionUrl) return;
    try {
      await Linking.openURL(actionUrl);
    } catch (error) {
      console.log("failed to open helper modal url:", error);
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {actionLabel && actionUrl ? (
            <TouchableOpacity onPress={handleActionPress} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>{actionLabel}</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default HelperModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(16, 18, 22, 0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFDF9",
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "#E7DED1",
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#302922",
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: "#62584D",
  },
  actionButton: {
    marginTop: 20,
    backgroundColor: "#8C8C8A",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  closeButton: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 10,
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#7A7064",
  },
});
