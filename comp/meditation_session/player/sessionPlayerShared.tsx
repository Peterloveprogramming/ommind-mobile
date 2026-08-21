import React from "react";
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { images } from "@/constants/images";
import { FONTS } from "@/theme";

export const TRACKER_SIZE = 24;

export const formatTime = (timeInSeconds: number) => {
  const safeTime = Number.isFinite(timeInSeconds) ? Math.max(timeInSeconds, 0) : 0;
  const minutes = Math.floor(safeTime / 60);
  const seconds = Math.floor(safeTime % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const formatProgressPromptTime = (timeInSeconds: number) => {
  const safeTime = Number.isFinite(timeInSeconds)
    ? Math.max(Math.floor(timeInSeconds), 0)
    : 0;
  const minutes = Math.floor(safeTime / 60);
  const seconds = safeTime % 60;

  if (minutes <= 0) {
    return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
  }

  return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ${seconds} ${
    seconds === 1 ? "second" : "seconds"
  }`;
};

type PlayerBackgroundProps = {
  backgroundUrl?: string;
  children: React.ReactNode;
};

export function PlayerBackground({ backgroundUrl, children }: PlayerBackgroundProps) {
  const backgroundSource = backgroundUrl ? { uri: backgroundUrl } : images.meditation_test;
  const backgroundBlurRadius = backgroundUrl ? 0 : 24;

  return (
    <ImageBackground
      source={backgroundSource}
      blurRadius={backgroundBlurRadius}
      style={styles.backgroundContainer}
    >
      {children}
    </ImageBackground>
  );
}

type BufferingBadgeProps = {
  isBusy?: boolean;
  text: string;
};

export function BufferingBadge({ isBusy = false, text }: BufferingBadgeProps) {
  return (
    <View style={styles.bufferingBadge}>
      {isBusy ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
      <Text style={styles.bufferingText}>{text}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 30,
  },
  currentTime: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 40,
    color: "#FFFFFF",
    alignSelf: "flex-start",
    marginTop: 40,
  },
  title: {
    flex: 1,
    marginRight: 12,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 20,
    color: "#FFFFFF",
  },
  bufferingBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  bufferingText: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 13,
    color: "#FFFFFF",
  },
  image: {
    marginTop: 125,
    height: 300,
    width: 300,
    borderRadius: 25,
    overflow: "hidden",
  },
  timeline: {
    width: "95%",
    marginTop: 16,
    marginBottom: 8,
  },
  progressTrack: {
    width: "100%",
    height: 7,
    borderRadius: 999,
    backgroundColor: "#A0A0A2",
    overflow: "visible",
    justifyContent: "center",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#8A8A8B",
  },
  progressTrackerWrapper: {
    position: "absolute",
    left: 0,
    top: "50%",
    marginTop: -TRACKER_SIZE / 2,
  },
  progressTrackerTouchArea: {
    width: TRACKER_SIZE,
    height: TRACKER_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTracker: {
    width: TRACKER_SIZE,
    height: TRACKER_SIZE,
  },
  timeRow: {
    width: "100%",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 13,
    color: "#8E8E93",
  },
  iconRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  iconButtonPreview: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryIconButtonPreview: {
    width: 44,
    height: 44,
  },
  iconPreviewImage: {
    width: 24,
    height: 24,
  },
  primaryIconPreviewImage: {
    width: 44,
    height: 44,
  },
  resumeModalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  resumeModalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 18,
    padding: 22,
    backgroundColor: "#FFFFFF",
  },
  resumeModalTitle: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 20,
    color: "#1C1C1E",
  },
  resumeModalText: {
    marginTop: 10,
    fontFamily: FONTS.figtreeMedium,
    fontSize: 15,
    lineHeight: 22,
    color: "#4A4A4D",
  },
  resumeModalButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
  },
  resumeModalButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  resumeModalPrimaryButton: {
    backgroundColor: "#1C1C1E",
  },
  resumeModalSecondaryButton: {
    backgroundColor: "#F0F0F2",
  },
  resumeModalPrimaryButtonText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 15,
    color: "#FFFFFF",
  },
  resumeModalSecondaryButtonText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 15,
    color: "#1C1C1E",
  },
});
