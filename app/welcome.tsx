import { Text, View, StyleSheet, ImageBackground, ScrollView, Image, Platform, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useSafeAreaFrame, useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS } from "@/theme.js";
import { images } from "@/constants/images";
import BaseButton from "@/comp/base/BaseButton";
import GoogleLogo from "@/assets/svg/auth/GoogleLogo";
import AppleLogo from "@/assets/svg/auth/AppleLogo";

// Figma frame (iPhone 15/16, 393x852): logo sits 16pt under the status bar and
// the welcome copy starts at 322pt. The copy is placed as a fraction of the
// screen height so it lands in the same spot on every device and doesn't jump
// when the login options are toggled; the buttons are pinned to the bottom.
const DESIGN_HEIGHT = 852;
const WELCOME_TEXT_TOP = 322;
const LOGO_TOP_GAP = 16;
const LOGO_HEIGHT = 103;
const LOGO_WIDTH = 96;

const Welcome = () => {
  const router = useRouter();
  const frame = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  const logoBottom = insets.top + LOGO_TOP_GAP + LOGO_HEIGHT;
  const welcomeTextGap = Math.max(24, frame.height * (WELCOME_TEXT_TOP / DESIGN_HEIGHT) - logoBottom);
  // 42pt from the bottom edge on the design frame = 34pt home indicator + 8.
  const bottomPadding = Math.max(insets.bottom + 8, 24);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground source={images.welcome_background} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
        <Defs>
          <LinearGradient id="welcomeScrim" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#040404" stopOpacity={0.16} />
            <Stop offset="0.45" stopColor="#030303" stopOpacity={0.2} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0.4} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#welcomeScrim)" />
      </Svg>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + LOGO_TOP_GAP, paddingBottom: bottomPadding },
        ]}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        <Image source={images.ommind_logo} style={styles.logo} resizeMode="cover" />

        <View style={[styles.welcomeTextContainer, { marginTop: welcomeTextGap }]}>
          <Text style={styles.welcomeMainText}>WELCOME</Text>
          <Text style={styles.welcomeSubText}>
            A sanctuary for meditation, insight, and inner transformation.
          </Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.bottomSection}>
          <View style={styles.buttonList}>
            {showLoginOptions ? (
              <>
                <BaseButton
                  text={"Login With Email"}
                  textStyle={styles.primaryButtonText}
                  onPress={() => router.push("/authentication/login")}
                />
                <BaseButton
                  backgroundColor="white"
                  fontColor="black"
                  text={"Continue with Google"}
                  textStyle={styles.socialButtonText}
                  onPress={() => console.log("hello")}
                  useIcon={true}
                  icon={<GoogleLogo />}
                />
                {Platform.OS === "ios" ? (
                  <BaseButton
                    backgroundColor="white"
                    fontColor="black"
                    text={"Continue with Apple"}
                    textStyle={styles.socialButtonText}
                    onPress={() => console.log("hello")}
                    useIcon={true}
                    icon={<AppleLogo />}
                  />
                ) : null}
                <BaseButton
                  backgroundColor="transparent"
                  height={40}
                  text={"Return"}
                  textStyle={styles.socialButtonText}
                  onPress={() => setShowLoginOptions(false)}
                />
              </>
            ) : (
              <>
                <BaseButton
                  text={"Login"}
                  textStyle={styles.primaryButtonText}
                  onPress={() => setShowLoginOptions(true)}
                />
                <TouchableOpacity
                  style={styles.signUpButton}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  onPress={() => router.push("/authentication/registration")}
                >
                  <Text style={styles.signUpText}>
                    Don’t have an account? <Text style={styles.signUpTextBold}>Sign Up</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text style={styles.termsAndConditionText}>
            By clicking on “Let’s Start!” or “Sign In”, you agree to the{" "}
            <Text style={[styles.termsLink, { fontFamily: FONTS.interBlack }]}>Terms of Use</Text>
            {" and "}
            <Text style={[styles.termsLink, { fontFamily: FONTS.interExtraBold }]}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Welcome;

// Explicit lineHeights (and no Android font padding) so text boxes are the
// same height on iOS and Android.
const baseText = {
  color: "white",
  includeFontPadding: false,
} as const;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 23,
  },
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  },
  welcomeTextContainer: {
    width: "100%",
    alignItems: "center",
    gap: 5,
  },
  welcomeMainText: {
    ...baseText,
    fontFamily: FONTS.figtreeBold,
    fontSize: 32,
    lineHeight: 38,
    textAlign: "center",
  },
  welcomeSubText: {
    ...baseText,
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 20,
    lineHeight: 24,
    textAlign: "center",
  },
  spacer: {
    flex: 1,
    minHeight: 16,
  },
  bottomSection: {
    width: "100%",
    maxWidth: 400,
    gap: 20,
  },
  buttonList: {
    width: "100%",
    gap: 16,
  },
  primaryButtonText: {
    fontFamily: FONTS.figtreeSemiBold,
    lineHeight: 22,
    letterSpacing: -0.408,
    includeFontPadding: false,
  },
  socialButtonText: {
    fontFamily: FONTS.interSemiBold,
    lineHeight: 22,
    letterSpacing: -0.408,
    includeFontPadding: false,
  },
  signUpButton: {
    height: 40,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  signUpText: {
    ...baseText,
    fontFamily: FONTS.figtreeMedium,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.408,
    textAlign: "center",
  },
  signUpTextBold: {
    fontFamily: FONTS.figtreeSemiBold,
  },
  termsAndConditionText: {
    ...baseText,
    fontFamily: FONTS.interSemiBold,
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.06,
    textAlign: "center",
  },
  termsLink: {
    textDecorationLine: "underline",
  },
});
