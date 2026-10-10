import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  type ImageSourcePropType,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CloseIcon from "@/assets/svg/meditation_session/CloseIcon";
import ShareIcon from "@/assets/svg/meditation_session/ShareIcon";
import BookmarkButtonWhite from "@/comp/buttons/BookmarkButtonWhite";
import { images } from "@/constants/images";
import { FONTS } from "@/theme";

// Figma "Play" (2546:9671 playing, 2546:9728 paused), drawn on a 394×844 frame
// with a 59px status bar and 34px home indicator. Fixed offsets are converted
// to safe-area-relative values so the layout holds on iOS and Android.
export const PLAYER_UI = {
  maxContentWidth: 480,
  maxFontSizeMultiplier: 1.2,
  headerGutter: 23,
  headerTopOffset: -7,
  headerMinTop: 12,
  headerButtonSize: 48,
  contentGutter: 28,
  artworkGutter: 37,
  artworkMinVerticalGap: 40,
  artworkRadius: 25,
  bottomOffset: 22,
  minBottom: 34,
  backgroundBlurRadius: 15,
  progressThumbSize: 16,
  progressTrackHeight: 4,
  progressTouchHeight: 24,
} as const;

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

type PlayerScaffoldProps = {
  backgroundUrl?: string;
  artworkSource?: ImageSourcePropType;
  // Rendered on top of the artwork, e.g. a buffering badge.
  artworkOverlay?: React.ReactNode;
  onClose: () => void;
  onShare?: () => void;
  children: React.ReactNode;
};

// Blurred background, top navigation bar and artwork shared by both players.
// `children` is the bottom-anchored info/controls block; the artwork shrinks to
// whatever height is left so short screens never overflow.
export function PlayerScaffold({
  backgroundUrl,
  artworkSource,
  artworkOverlay,
  onClose,
  onShare,
  children,
}: PlayerScaffoldProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [artworkSlotHeight, setArtworkSlotHeight] = useState(0);

  const contentWidth = Math.min(width, PLAYER_UI.maxContentWidth);
  const maxArtworkSize = contentWidth - PLAYER_UI.artworkGutter * 2;
  const artworkSize =
    artworkSlotHeight > 0
      ? Math.max(
          0,
          Math.min(maxArtworkSize, artworkSlotHeight - PLAYER_UI.artworkMinVerticalGap)
        )
      : maxArtworkSize;
  const backgroundSource = backgroundUrl
    ? { uri: backgroundUrl }
    : (artworkSource ?? images.meditation_test);

  const handleArtworkSlotLayout = (event: LayoutChangeEvent) => {
    setArtworkSlotHeight(event.nativeEvent.layout.height);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Image
        source={backgroundSource}
        blurRadius={PLAYER_UI.backgroundBlurRadius}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, styles.backgroundDim]} />

      <View
        style={[
          styles.content,
          {
            paddingTop: Math.max(insets.top + PLAYER_UI.headerTopOffset, PLAYER_UI.headerMinTop),
            paddingBottom: Math.max(insets.bottom + PLAYER_UI.bottomOffset, PLAYER_UI.minBottom),
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close player"
            hitSlop={8}
            onPress={onClose}
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
          >
            <CloseIcon />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share"
            hitSlop={8}
            onPress={onShare}
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
          >
            <ShareIcon />
          </Pressable>
        </View>

        <View style={styles.artworkSlot} onLayout={handleArtworkSlotLayout}>
          <View style={styles.artworkSpacerTop} />
          <View style={[styles.artwork, { width: artworkSize, height: artworkSize }]}>
            {artworkSource ? (
              <Image source={artworkSource} resizeMode="cover" style={styles.artworkImage} />
            ) : null}
            {artworkOverlay ? <View style={styles.artworkOverlay}>{artworkOverlay}</View> : null}
          </View>
          <View style={styles.artworkSpacerBottom} />
        </View>

        {children}
      </View>
    </View>
  );
}

type PlayerTitleBlockProps = {
  // Large countdown above the title; omitted for generated sessions.
  timeText?: string;
  timeAccessibilityLabel?: string;
  title: string;
  isBookmarked: boolean;
  isBookmarkDisabled?: boolean;
  onBookmarkPress: () => void;
};

export function PlayerTitleBlock({
  timeText,
  timeAccessibilityLabel,
  title,
  isBookmarked,
  isBookmarkDisabled = false,
  onBookmarkPress,
}: PlayerTitleBlockProps) {
  return (
    <View style={styles.titleBlock}>
      {timeText ? (
        <Text
          accessibilityLabel={timeAccessibilityLabel}
          maxFontSizeMultiplier={PLAYER_UI.maxFontSizeMultiplier}
          numberOfLines={1}
          style={styles.largeTime}
        >
          {timeText}
        </Text>
      ) : null}
      <View style={styles.titleRow}>
        <Text
          accessibilityRole="header"
          maxFontSizeMultiplier={PLAYER_UI.maxFontSizeMultiplier}
          numberOfLines={2}
          style={styles.title}
        >
          {title}
        </Text>
        <BookmarkButtonWhite
          onTouch={onBookmarkPress}
          isBookmarked={isBookmarked}
          disabled={isBookmarkDisabled}
        />
      </View>
    </View>
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
      <Text maxFontSizeMultiplier={PLAYER_UI.maxFontSizeMultiplier} style={styles.bufferingText}>
        {text}
      </Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  backgroundDim: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: PLAYER_UI.maxContentWidth,
    alignSelf: "center",
  },
  header: {
    height: PLAYER_UI.headerButtonSize,
    paddingHorizontal: PLAYER_UI.headerGutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: PLAYER_UI.headerButtonSize,
    height: PLAYER_UI.headerButtonSize,
    borderRadius: PLAYER_UI.headerButtonSize / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  pressed: {
    opacity: 0.7,
  },
  artworkSlot: {
    flex: 1,
    alignItems: "center",
  },
  // Figma gaps around the artwork are 43 above and 84 below; extra or missing
  // height is shared in the same ratio.
  artworkSpacerTop: {
    flex: 43,
  },
  artworkSpacerBottom: {
    flex: 84,
  },
  artwork: {
    borderRadius: PLAYER_UI.artworkRadius,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    boxShadow: "0px 0px 4px 0px rgba(0, 0, 0, 0.25)",
  },
  artworkImage: {
    width: "100%",
    height: "100%",
    borderRadius: PLAYER_UI.artworkRadius,
  },
  artworkOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 16,
    alignItems: "center",
  },
  section: {
    paddingHorizontal: PLAYER_UI.contentGutter,
  },
  titleBlock: {
    paddingHorizontal: PLAYER_UI.contentGutter,
    gap: 15,
  },
  // Figma sets 48px text on a 28px line box. A line height below the font size
  // clips glyphs on Android, so use a full line and pull the box back to 28px.
  largeTime: {
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 48,
    lineHeight: 56,
    marginVertical: -14,
    color: "#FFFFFF",
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  titleRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    marginRight: 34,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 22,
    lineHeight: 28,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
  bufferingBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  bufferingText: {
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 13,
    color: "#FFFFFF",
  },
  generatedStatus: {
    marginTop: 24,
  },
  playbackBlock: {
    marginTop: 40,
    gap: 20,
  },
  timeline: {
    gap: 15,
  },
  // The 4px track sits in a 24px touch area; negative margins keep the
  // layout height at the Figma 4px.
  progressTouchArea: {
    height: PLAYER_UI.progressTouchHeight,
    marginVertical: (PLAYER_UI.progressTrackHeight - PLAYER_UI.progressTouchHeight) / 2,
    justifyContent: "center",
  },
  progressTrack: {
    height: PLAYER_UI.progressTrackHeight,
    borderRadius: 8,
    backgroundColor: "#A0A0A2",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#F0F0F0",
  },
  progressThumbWrapper: {
    position: "absolute",
    left: -PLAYER_UI.progressThumbSize / 2,
    top: (PLAYER_UI.progressTouchHeight - PLAYER_UI.progressThumbSize * 2) / 2,
  },
  progressThumbTouchArea: {
    width: PLAYER_UI.progressThumbSize * 2,
    height: PLAYER_UI.progressThumbSize * 2,
    alignItems: "center",
    justifyContent: "center",
  },
  progressThumb: {
    width: PLAYER_UI.progressThumbSize,
    height: PLAYER_UI.progressThumbSize,
    borderRadius: PLAYER_UI.progressThumbSize / 2,
    backgroundColor: "#F0F0F0",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 12,
    lineHeight: 13,
    letterSpacing: 0.6,
    color: "#A0A0A2",
    fontVariant: ["tabular-nums"],
  },
  controlsRow: {
    paddingHorizontal: PLAYER_UI.contentGutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  controlIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  controlDisabled: {
    opacity: 0.4,
  },
  loopIcon: {
    width: 26,
    height: 25,
  },
  loopImage: {
    width: "100%",
    height: "100%",
  },
  loopSlash: {
    position: "absolute",
    left: 2,
    top: 1.5,
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
