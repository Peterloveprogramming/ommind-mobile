import { images } from "@/constants/images";
import { FONTS } from "@/theme";
import React from "react";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MeditationCardProps = {
  image_source?: string;
  numberOfSessions: number;
  description: string;
  uuid:string,
  onPress: () => void;
};

const MeditationCard = ({
  image_source = images.meditation_test,
  numberOfSessions,
  description,
  uuid,
  onPress,
}: MeditationCardProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.card}>
        <ImageBackground
          source={image_source ? { uri: image_source } : images.meditation_test}
          style={styles.image}
          imageStyle={styles.imageInner}
        />

        <View style={styles.rightPanel}>
          <Text style={styles.sessions}>{numberOfSessions} Sessions</Text>

          <Text style={styles.description}>{description}</Text>

          <Text style={styles.type}>Guided Meditation</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MeditationCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    width: 270,
    height: 120,
    flexDirection: "row",
    borderWidth: 0.1,
    borderColor: "#8B8B8B",
    backgroundColor: "#FFFFFF",
    shadowColor: "#8B8B8B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  image: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    overflow: "hidden",
  },
  imageInner: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  rightPanel: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    padding: 10,
    justifyContent: "center",
    width: 150,
    gap: 5,
  },
  sessions: {
    color: "#8B8B8B",
    fontFamily: FONTS.figtreeMedium,
  },
  description: {
    flexShrink: 1,
    flexWrap: "wrap",
    color: "#0F0909",
    fontFamily: FONTS.figtreeSemiBold,
  },
  type: {
    color: "#8B8B8B",
    fontFamily: FONTS.figtreeMedium,
  },
});
