import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import PromptDot from "@/assets/svg/journal/PromptDot";
import { FONTS } from "@/theme.js";

const MAGIC_BULB_IMAGE = require("@/assets/images/journal/magic_bulb.png");
const MAX_FONT_SIZE_MULTIPLIER = 1.3;

type ReflectionPromptsFooterProps = {
  prompts: string[];
  isVisible: boolean;
  onToggle: (isVisible: boolean) => void;
};

// Figma 3128:9998: bulb drawn 20×20 inside a 22×22 frame, at 84% opacity.
const ReflectionBulb = () => (
  <View style={styles.bulbFrame}>
    <Image source={MAGIC_BULB_IMAGE} resizeMode="cover" style={styles.bulbImage} />
  </View>
);

export default function ReflectionPromptsFooter({
  prompts,
  isVisible,
  onToggle,
}: ReflectionPromptsFooterProps) {
  if (!isVisible) {
    return (
      <Pressable
        onPress={() => onToggle(true)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityState={{ expanded: false }}
        style={({ pressed }) => [styles.pill, styles.showPill, pressed && styles.pressed]}
      >
        <ReflectionBulb />
        <Text numberOfLines={1} maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.pillText}>
          Not sure what to write?
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ReflectionBulb />
        <Text maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.pillText}>
          Try writing about…
        </Text>
      </View>

      <View>
        {prompts.map((prompt) => (
          <View key={prompt} style={styles.promptRow}>
            <PromptDot />
            <Text style={styles.promptText}>{prompt}</Text>
          </View>
        ))}
      </View>

      <View style={styles.hideRow}>
        <Pressable
          onPress={() => onToggle(false)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityState={{ expanded: true }}
          style={({ pressed }) => [styles.pill, styles.hidePill, pressed && styles.pressed]}
        >
          <Text numberOfLines={1} maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} style={styles.pillText}>
            Hide writing prompts
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 36,
    borderRadius: 50,
    backgroundColor: "#EEEEEE",
    borderWidth: 1,
    borderColor: "rgba(143,143,143,0.34)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  showPill: {
    paddingLeft: 10,
    paddingRight: 15,
  },
  hidePill: {
    paddingHorizontal: 15,
  },
  pressed: {
    opacity: 0.7,
  },
  pillText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#757575",
    includeFontPadding: false,
  },
  bulbFrame: {
    width: 22,
    height: 22,
    overflow: "hidden",
  },
  bulbImage: {
    width: 20,
    height: 20,
    marginLeft: 1,
    opacity: 0.84,
  },
  card: {
    alignSelf: "stretch",
    marginHorizontal: 23,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(143,143,143,0.34)",
    borderRadius: 10,
    paddingTop: 15,
    paddingBottom: 10,
    paddingHorizontal: 10,
    gap: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  promptRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 5,
  },
  promptText: {
    flex: 1,
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#8C8C8A",
    includeFontPadding: false,
  },
  hideRow: {
    alignItems: "center",
  },
});
