import Send from "@/assets/svg/profile/Send";
import ProfileScreenHeader, { PROFILE_HEADER_UI } from "@/comp/profile/ProfileScreenHeader";
import { COLORS, FONTS } from "@/theme";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

// Shared geometry for the Figma "Report a bug" (2919:11978), "Suggest an improvement"
// (2919:12163) and "Contact us" (2919:12250) frames, all 394 x 852.
export const PROFILE_FORM_UI = {
  background: "#FAFAFA",
  designHeight: 852,
  minVerticalScale: 0.75,      // vertical gaps shrink on short phones, never below 75%
  gutter: PROFILE_HEADER_UI.gutter,
  maxContentWidth: PROFILE_HEADER_UI.maxContentWidth,
  maxFontSizeMultiplier: PROFILE_HEADER_UI.maxFontSizeMultiplier,
  contentTopBias: 16,          // Figma content sits 16 below the centre of the free space
  keyboardBottomOffset: 24,
  placeholderColor: "#8E8E93",
  inputColor: "#0E1921",
  errorColor: "#C2452D",
  submitHeight: 36,
} as const;

// Scales a Figma vertical gap so the layout keeps its proportions on shorter screens.
export const useProfileFormGap = () => {
  const { height } = useWindowDimensions();
  const scale = Math.min(
    1,
    Math.max(PROFILE_FORM_UI.minVerticalScale, height / PROFILE_FORM_UI.designHeight),
  );

  return (designGap: number) => Math.round(designGap * scale);
};

type ProfileFormScreenProps = {
  title: string;
  // Figma uses Figtree Regular for "Report a bug" and SemiBold for the other two titles.
  titleVariant?: "regular" | "semibold";
  onBackPress: () => void;
  children: React.ReactNode;
};

const ProfileFormScreen = ({
  title,
  titleVariant = "semibold",
  onBackPress,
  children,
}: ProfileFormScreenProps) => {
  const tabBarHeight = useBottomTabBarHeight();

  // The form is rendered inside the Profile tab, so the Android back button closes it.
  useFocusEffect(
    React.useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        onBackPress();
        return true;
      });

      return () => subscription.remove();
    }, [onBackPress]),
  );

  return (
    <View style={styles.container}>
      <ProfileScreenHeader title={title} titleVariant={titleVariant} onBackPress={onBackPress} />

      <KeyboardAwareScrollView
        bottomOffset={PROFILE_FORM_UI.keyboardBottomOffset}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: tabBarHeight },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <View style={styles.content}>{children}</View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default ProfileFormScreen;

type ProfileFormSubmitButtonProps = {
  label?: string;
  isSubmitting?: boolean;
  onPress: () => void;
};

export const ProfileFormSubmitButton = ({
  label = "Submit",
  isSubmitting = false,
  onPress,
}: ProfileFormSubmitButtonProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
    disabled={isSubmitting}
    hitSlop={6}
    onPress={onPress}
    style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
  >
    {/* Content stays laid out while loading so the pill keeps its Figma width. */}
    <View style={[styles.submitContent, isSubmitting && styles.hidden]}>
      <Send />
      <Text maxFontSizeMultiplier={PROFILE_FORM_UI.maxFontSizeMultiplier} style={styles.submitText}>
        {label}
      </Text>
    </View>
    {isSubmitting ? (
      <View style={styles.submitSpinner}>
        <ActivityIndicator color="#FFFFFF" size="small" />
      </View>
    ) : null}
  </Pressable>
);

export const ProfileFormErrorText = ({ children }: { children?: string }) =>
  children ? (
    <Text
      accessibilityLiveRegion="polite"
      maxFontSizeMultiplier={PROFILE_FORM_UI.maxFontSizeMultiplier}
      style={styles.errorText}
    >
      {children}
    </Text>
  ) : null;

// Figtree Medium 16 / 20, -0.24 tracking: labels, placeholders and helper copy.
export const profileFormTextStyles = StyleSheet.create({
  body: {
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: PROFILE_FORM_UI.placeholderColor,
    textAlign: "center",
  },
  input: {
    alignSelf: "stretch",
    paddingHorizontal: PROFILE_FORM_UI.gutter,
    paddingTop: 0,
    paddingBottom: 0,
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: PROFILE_FORM_UI.inputColor,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PROFILE_FORM_UI.background,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: PROFILE_FORM_UI.contentTopBias,
  },
  content: {
    width: "100%",
    maxWidth: PROFILE_FORM_UI.maxContentWidth,
    alignSelf: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  submitButton: {
    height: PROFILE_FORM_UI.submitHeight,
    borderRadius: PROFILE_FORM_UI.submitHeight / 2,
    backgroundColor: COLORS.brandYellow,
    paddingLeft: 10,
    paddingRight: 15,
    justifyContent: "center",
  },
  submitContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  hidden: {
    opacity: 0,
  },
  submitSpinner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#FFFFFF",
  },
  errorText: {
    marginTop: 12,
    maxWidth: 261,
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: PROFILE_FORM_UI.errorColor,
    textAlign: "center",
  },
});
