import { images } from "@/constants/images";
import { COLORS, FONTS } from "@/theme";
import React, { useMemo } from "react";
import {
  DimensionValue,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type MeditationSessionCardProps = {
  session_length: number;
  session_title: string;
  image_url?: string;
  session_progress?: number | null;
  generated_meditation?:number | null;
  onPress: () => void;
  variant?: "default" | "profile" | "list";
};

const clampProgress = (value: number) => Math.max(0, Math.min(value, 1));

const MeditationSessionCard = ({
  session_length,
  session_title,
  image_url,
  session_progress,
  onPress,
  generated_meditation,
  variant = "default",
}: MeditationSessionCardProps) => {
  // "profile" restyles the card for Profile's Recently Played (spec 07);
  // "list" is the same card stretched full width for the Saved / Recently Played screens;
  // "default" (Home) keeps the base styles untouched.
  const isList = variant === "list";
  const isProfile = variant === "profile" || isList;
  const lengthLabel = isList
    ? `${session_length} ${session_length === 1 ? "min" : "mins"}`
    : `${session_length} min`;
  const maxFontSizeMultiplier = isProfile ? 1.2 : undefined;

  const progressWidth = useMemo<DimensionValue>(() => {
    const sessionLengthInSeconds = Math.max(session_length * 60, 0);
    if (!sessionLengthInSeconds || !session_progress) {
      return "0%";
    }

    return `${clampProgress(session_progress / sessionLengthInSeconds) * 100}%`;
  }, [session_length, session_progress]);

  return (
    <TouchableOpacity activeOpacity={0.86} onPress={onPress}>
      <View style={[styles.card, isProfile && profileStyles.card, isList && listStyles.card]}>
        <ImageBackground
          source={image_url ? { uri: image_url } : images.meditation_test}
          style={styles.image}
          imageStyle={styles.imageInner}
        />

        <View style={[styles.rightPanel, isProfile && profileStyles.rightPanel]}>
          {generated_meditation ? null : <Text style={[styles.lengthText, isProfile && profileStyles.metaText]} maxFontSizeMultiplier={maxFontSizeMultiplier}>{lengthLabel}</Text>}
          <Text style={[styles.titleText, isProfile && profileStyles.titleText, isList && listStyles.titleText]} numberOfLines={3} maxFontSizeMultiplier={maxFontSizeMultiplier}>{session_title}</Text>
          <Text style={[styles.typeText, isProfile && profileStyles.metaText]} maxFontSizeMultiplier={maxFontSizeMultiplier}>{generated_meditation?"Generated Guided Meditation":"Guided Meditation"}</Text>
        </View>

        {isList ? null : (
          <View style={[styles.progressTrack, isProfile && profileStyles.progressTrack]}>
            <View style={[styles.progressFill, isProfile && profileStyles.progressFill, { width: progressWidth }]} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default MeditationSessionCard;

const styles = StyleSheet.create({
  card: {
    width: 310,
    height: 120,
    borderRadius: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E4E1DD",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  image: {
    width: 120,
    height: 120,
  },
  imageInner: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  rightPanel: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 18,
    justifyContent: "center",
  },
  lengthText: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 14,
    lineHeight: 18,
    color: "#8B8B8B",
  },
  titleText: {
    marginTop: 4,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 17,
    lineHeight: 21,
    color: "#4D4A4A",
  },
  typeText: {
    marginTop: 6,
    fontFamily: FONTS.figtreeMedium,
    fontSize: 14,
    lineHeight: 18,
    color: "#8B8B8B",
  },
  progressTrack: {
    position: "absolute",
    left: 120,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: "#EEE9E1",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#E6AA18",
  },
});

// Figma Profile "Recently Played" card (2931:10904). Merged over `styles`.
const profileStyles = StyleSheet.create({
  card: {
    width: 300,
    borderColor: "#E8E8E8",
  },
  rightPanel: {
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 0,
    justifyContent: "center",
    gap: 7,
  },
  // Shared by the length and type texts.
  metaText: {
    marginTop: 0,
    fontFamily: FONTS.figtreeMedium,
    fontSize: 12,
    lineHeight: 13,
    letterSpacing: 0.6,
    color: "#8B8B8B",
    includeFontPadding: false,
  },
  titleText: {
    marginTop: 0,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 16,
    lineHeight: 17,
    letterSpacing: 0.32,
    color: "rgba(15, 9, 9, 0.74)",
    textTransform: "capitalize",
    includeFontPadding: false,
  },
  progressTrack: {
    height: 1,
    backgroundColor: "transparent",
  },
  progressFill: {
    backgroundColor: COLORS.brandYellow,
  },
});

// Figma Saved (2919:11898) / Recently Played (2931:10960) card: the profile card at full row width.
// Merged over `profileStyles`.
const listStyles = StyleSheet.create({
  card: {
    width: "100%",
  },
  // Figma reserves three title lines, which pins the type text to the bottom of the column.
  titleText: {
    minHeight: 51,
  },
});
