import React from "react";
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FONTS } from "@/theme";

type ProfilePhotoUploadModalProps = {
  visible: boolean;
  onClose: () => void;
  previewSource?: ImageSourcePropType;
  title?: string;
  subtitle?: string;
  primaryActionLabel?: string;
  helperText?: string;
  errorText?: string;
  isLoading?: boolean;
  onPrimaryPress?: () => void;
};

const DEFAULT_PREVIEW_SOURCE = require("@/assets/images/home/meditation_icon.png");

const ProfilePhotoUploadModal = ({
  visible,
  onClose,
  previewSource = DEFAULT_PREVIEW_SOURCE,
  title = "Upload profile photo",
  subtitle = "Choose a square photo from your device for your profile picture.",
  primaryActionLabel = "Upload photo",
  helperText = "Accepted formats: JPG, PNG, WEBP. Maximum file size: 5MB.",
  errorText,
  isLoading = false,
  onPrimaryPress,
}: ProfilePhotoUploadModalProps) => {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.previewWrap}>
            <Image source={previewSource} style={styles.previewImage} />
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>Preview</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
            onPress={onPrimaryPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>{primaryActionLabel}</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.helperText}>{helperText}</Text>
          {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ProfilePhotoUploadModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17, 17, 17, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 28,
    backgroundColor: "#FFFDF9",
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 24,
    lineHeight: 30,
    color: "#111111",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3EEE7",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 22,
    lineHeight: 24,
    color: "#4B4748",
  },
  subtitle: {
    marginTop: 10,
    fontFamily: FONTS.inter,
    fontSize: 14,
    lineHeight: 20,
    color: "#7A7470",
  },
  previewWrap: {
    marginTop: 24,
    alignSelf: "center",
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: "#F6EEE1",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  previewImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
    resizeMode: "cover",
  },
  previewBadge: {
    position: "absolute",
    right: 2,
    bottom: 8,
    borderRadius: 999,
    backgroundColor: "#F7C648",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  previewBadgeText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: "#4B4748",
  },
  primaryButton: {
    marginTop: 26,
    minHeight: 50,
    borderRadius: 999,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: "#FFFFFF",
  },
  helperText: {
    marginTop: 16,
    textAlign: "center",
    fontFamily: FONTS.inter,
    fontSize: 12,
    lineHeight: 18,
    color: "#9A9593",
  },
  errorText: {
    marginTop: 10,
    textAlign: "center",
    fontFamily: FONTS.inter,
    fontSize: 12,
    lineHeight: 18,
    color: "#C2452D",
  },
});
