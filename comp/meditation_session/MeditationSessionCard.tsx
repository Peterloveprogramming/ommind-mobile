import { images } from "@/constants/images";
import { FONTS } from "@/theme";
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
  onPress: () => void;
};

const clampProgress = (value: number) => Math.max(0, Math.min(value, 1));

const MeditationSessionCard = ({
  session_length,
  session_title,
  image_url,
  session_progress,
  onPress,
}: MeditationSessionCardProps) => {
  const progressWidth = useMemo<DimensionValue>(() => {
    const sessionLengthInSeconds = Math.max(session_length * 60, 0);
    if (!sessionLengthInSeconds || !session_progress) {
      return "0%";
    }

    return `${clampProgress(session_progress / sessionLengthInSeconds) * 100}%`;
  }, [session_length, session_progress]);

  return (
    <TouchableOpacity activeOpacity={0.86} onPress={onPress}>
      <View style={styles.card}>
        <ImageBackground
          source={image_url ? { uri: image_url } : images.meditation_test}
          style={styles.image}
          imageStyle={styles.imageInner}
        />

        <View style={styles.rightPanel}>
          <Text style={styles.lengthText}>{session_length} min</Text>
          <Text style={styles.titleText} numberOfLines={3}>{session_title}</Text>
          <Text style={styles.typeText}>Guided Meditation</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
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
