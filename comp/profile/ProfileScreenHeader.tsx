import ChevronLeft from "@/assets/svg/profile/ChevronLeft";
import { FONTS } from "@/theme";
import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Figma "Top NavigationBar" shared by the Profile sub-screens (forms, Saved, Recently Played):
// 48px back circle on a 23px gutter, sitting 52px from the top of a 59px status bar.
export const PROFILE_HEADER_UI = {
  gutter: 23,
  maxContentWidth: 480,
  maxFontSizeMultiplier: 1.2,
  topOffset: -7,
  minTop: 12,
  height: 48,
  backButtonSize: 48,
  backButtonColor: "rgba(71, 71, 71, 0.3)",
} as const;

type ProfileScreenHeaderProps = {
  title: string;
  // Figma uses Figtree Regular for some Profile titles and SemiBold for others.
  titleVariant?: "regular" | "semibold";
  titleStyle?: StyleProp<TextStyle>;
  onBackPress: () => void;
};

const ProfileScreenHeader = ({
  title,
  titleVariant = "semibold",
  titleStyle,
  onBackPress,
}: ProfileScreenHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        { paddingTop: Math.max(insets.top + PROFILE_HEADER_UI.topOffset, PROFILE_HEADER_UI.minTop) },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <ChevronLeft />
      </Pressable>
      <Text
        accessibilityRole="header"
        adjustsFontSizeToFit
        maxFontSizeMultiplier={PROFILE_HEADER_UI.maxFontSizeMultiplier}
        numberOfLines={1}
        style={[
          styles.title,
          titleVariant === "regular" ? styles.titleRegular : styles.titleSemiBold,
          titleStyle,
        ]}
      >
        {title}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
};

export default ProfileScreenHeader;

const styles = StyleSheet.create({
  header: {
    width: "100%",
    maxWidth: PROFILE_HEADER_UI.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: PROFILE_HEADER_UI.gutter,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: PROFILE_HEADER_UI.backButtonSize,
    height: PROFILE_HEADER_UI.backButtonSize,
    borderRadius: PROFILE_HEADER_UI.backButtonSize / 2,
    backgroundColor: PROFILE_HEADER_UI.backButtonColor,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 17,
    textAlign: "center",
  },
  titleRegular: {
    fontFamily: FONTS.figtreeMedium,
    lineHeight: 22,
    color: "#383838",
  },
  titleSemiBold: {
    fontFamily: FONTS.figtreeSemiBold,
    lineHeight: 28,
    letterSpacing: -1,
    color: "#000000",
  },
  spacer: {
    width: PROFILE_HEADER_UI.backButtonSize,
    height: PROFILE_HEADER_UI.height,
  },
  pressed: {
    opacity: 0.8,
  },
});
