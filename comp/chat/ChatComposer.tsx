import React, { useState } from "react";
import { ActivityIndicator, LayoutChangeEvent, Pressable, StyleSheet, TextInput, View } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import MicButton from "@/assets/svg/chat/MicButton";
import { FONTS } from "@/theme.js";

// Figma composer group 2100:5088 / 2100:5096 (OmMind).
const COMPOSER = {
  PANEL_PADDING_TOP: 17,
  PANEL_PADDING_HORIZONTAL: 10,
  PANEL_PADDING_BOTTOM_OPEN: 24,      // pill → keyboard top (Figma)
  PANEL_PADDING_BOTTOM_MIN: 24,       // pill → screen bottom, before safe area
  PILL_PADDING_LEFT: 15,
  PILL_PADDING_RIGHT: 5,
  PILL_PADDING_VERTICAL: 5,
  PILL_BORDER_WIDTH: 1,
  PILL_RADIUS: 32,                    // half of the 64 pt single-line height
  BUTTON_SIZE: 54,
  INPUT_FONT_SIZE: 16,
  INPUT_LINE_HEIGHT: 22,              // used for maths only, not set on the TextInput
  INPUT_LETTER_SPACING: -0.408,
  INPUT_MAX_LINES: 4,

  GRADIENT_TOP: "#D7D7D7",
  GRADIENT_TOP_OPACITY: 0.8,
  GRADIENT_BOTTOM: "#868484",
  GRADIENT_BOTTOM_OPACITY: 0.6,
  PILL_BACKGROUND: "#FAFAFA",
  PILL_BORDER: "#BBBBBB",
  PLACEHOLDER: "#868686",
  INPUT_TEXT: "#1E1E1E",              // Figma `sds text-default`
  BUTTON_BACKGROUND: "#F8C63E",       // Figma `Brand/03`
  BUTTON_ICON: "#FFFFFF",
  RECORDING_GLOW: "#FF8A3D",
  CONVERTING_GLOW: "#FFB06E",
} as const;

// One line of text centered in a 54 pt field: (54 − 22) / 2 = 16.
const INPUT_PADDING_VERTICAL = (COMPOSER.BUTTON_SIZE - COMPOSER.INPUT_LINE_HEIGHT) / 2;
const INPUT_MAX_HEIGHT =
  INPUT_PADDING_VERTICAL * 2 + COMPOSER.INPUT_LINE_HEIGHT * COMPOSER.INPUT_MAX_LINES;

type ChatComposerProps = {
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onSend: () => void;
  onMicPressIn: () => void;
  onMicPressOut: () => void;
  isMicPressed: boolean;
  isRecording: boolean;
  isConverting: boolean;
};

const ChatComposer = ({
  value,
  onChangeText,
  onFocus,
  onSend,
  onMicPressIn,
  onMicPressOut,
  isMicPressed,
  isRecording,
  isConverting,
}: ChatComposerProps) => {
  const insets = useSafeAreaInsets();
  const [panelSize, setPanelSize] = useState({ width: 0, height: 0 });
  const { progress } = useReanimatedKeyboardAnimation();
  const closedPadding = Math.max(insets.bottom, COMPOSER.PANEL_PADDING_BOTTOM_MIN);

  // Safe-area padding only while the composer touches the screen bottom;
  // animates to the Figma 24 pt gap in step with the keyboard.
  const panelStyle = useAnimatedStyle(
    () => ({
      paddingBottom: interpolate(
        progress.value,
        [0, 1],
        [closedPadding, COMPOSER.PANEL_PADDING_BOTTOM_OPEN],
        Extrapolation.CLAMP
      ),
    }),
    [closedPadding]
  );

  // Svg percentage sizing doesn't reliably fill an absolute box on Android,
  // so measure the panel and draw the gradient at its exact size.
  const handleBackgroundLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setPanelSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  };

  const hasText = value.trim().length > 0;
  // Stay in mic mode while recording/converting so press-out still stops it.
  const showSend = hasText && !isRecording && !isConverting;

  const renderButton = () => {
    if (showSend) {
      return (
        <Pressable
          onPress={onSend}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <View style={styles.circle}>
            <Ionicons name="arrow-up" size={24} color={COMPOSER.BUTTON_ICON} />
          </View>
        </Pressable>
      );
    }

    if (isConverting) {
      return (
        <View
          style={[
            styles.button,
            (isMicPressed || isRecording) && styles.buttonActive,
            styles.buttonConverting,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Hold to record a voice message"
          accessibilityState={{ busy: true, disabled: true }}
        >
          <View style={styles.circle}>
            <ActivityIndicator size="small" color={COMPOSER.BUTTON_ICON} />
          </View>
        </View>
      );
    }

    return (
      <Pressable
        onPressIn={onMicPressIn}
        onPressOut={onMicPressOut}
        accessibilityRole="button"
        accessibilityLabel="Hold to record a voice message"
        style={[styles.button, (isMicPressed || isRecording) && styles.buttonActive]}
      >
        <MicButton width={COMPOSER.BUTTON_SIZE} height={COMPOSER.BUTTON_SIZE} />
      </Pressable>
    );
  };

  return (
    <Animated.View style={[styles.panel, panelStyle]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={handleBackgroundLayout}>
        {panelSize.width > 0 && panelSize.height > 0 && (
          <Svg width={panelSize.width} height={panelSize.height}>
            <Defs>
              <LinearGradient
                id="omComposerGradient"
                x1={0}
                y1={panelSize.height * 0.19474}
                x2={0}
                y2={panelSize.height * 1.2053}
                gradientUnits="userSpaceOnUse"
              >
                <Stop
                  offset={0}
                  stopColor={COMPOSER.GRADIENT_TOP}
                  stopOpacity={COMPOSER.GRADIENT_TOP_OPACITY}
                />
                <Stop
                  offset={1}
                  stopColor={COMPOSER.GRADIENT_BOTTOM}
                  stopOpacity={COMPOSER.GRADIENT_BOTTOM_OPACITY}
                />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width={panelSize.width} height={panelSize.height} fill="url(#omComposerGradient)" />
          </Svg>
        )}
      </View>

      <View style={styles.pill}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          multiline
          placeholder="You can type here to reply..."
          placeholderTextColor={COMPOSER.PLACEHOLDER}
          accessibilityLabel="Message"
        />
        {renderButton()}
      </View>
    </Animated.View>
  );
};

export default React.memo(ChatComposer);

const styles = StyleSheet.create({
  panel: {
    position: "relative",
    overflow: "hidden",
    paddingTop: COMPOSER.PANEL_PADDING_TOP,
    paddingHorizontal: COMPOSER.PANEL_PADDING_HORIZONTAL,
  },
  pill: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    backgroundColor: COMPOSER.PILL_BACKGROUND,
    borderColor: COMPOSER.PILL_BORDER,
    borderWidth: COMPOSER.PILL_BORDER_WIDTH,
    borderRadius: COMPOSER.PILL_RADIUS,
    paddingLeft: COMPOSER.PILL_PADDING_LEFT,
    paddingRight: COMPOSER.PILL_PADDING_RIGHT,
    paddingVertical: COMPOSER.PILL_PADDING_VERTICAL,
  },
  input: {
    flex: 1,
    marginRight: 8,
    minHeight: COMPOSER.BUTTON_SIZE,
    maxHeight: INPUT_MAX_HEIGHT,
    paddingTop: INPUT_PADDING_VERTICAL,
    paddingBottom: INPUT_PADDING_VERTICAL,
    paddingHorizontal: 0,
    fontFamily: FONTS.figtreeMedium,
    fontSize: COMPOSER.INPUT_FONT_SIZE,
    letterSpacing: COMPOSER.INPUT_LETTER_SPACING,
    color: COMPOSER.INPUT_TEXT,
    textAlignVertical: "top",
    includeFontPadding: false,
  },
  button: {
    width: COMPOSER.BUTTON_SIZE,
    height: COMPOSER.BUTTON_SIZE,
    borderRadius: COMPOSER.BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonActive: {
    transform: [{ scale: 0.9 }],
    borderWidth: 1,
    borderColor: COMPOSER.RECORDING_GLOW,
    shadowColor: COMPOSER.RECORDING_GLOW,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  buttonConverting: {
    borderWidth: 1,
    borderColor: COMPOSER.CONVERTING_GLOW,
    shadowColor: COMPOSER.CONVERTING_GLOW,
  },
  circle: {
    width: COMPOSER.BUTTON_SIZE,
    height: COMPOSER.BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: COMPOSER.BUTTON_SIZE / 2,
    backgroundColor: COMPOSER.BUTTON_BACKGROUND,
  },
});
