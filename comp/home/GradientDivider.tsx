import React, { useId } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

const DIVIDER_COLOR = "#D9D9D9";

type Props = { style?: StyleProp<ViewStyle> }; // margins from the caller

// Figma divider (nodes 2958:10325 / 2958:10335): 1 pt line, #D9D9D9 fading
// 20% → 100% → 20%.
const GradientDivider = ({ style }: Props) => {
  // useId() returns ":r0:", and colons break url(#…), so strip them.
  const gradientId = "divider" + useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <View
      style={[styles.divider, style]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width="100%" height={1} pointerEvents="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={DIVIDER_COLOR} stopOpacity={0.2} />
            <Stop offset="0.51" stopColor={DIVIDER_COLOR} stopOpacity={1} />
            <Stop offset="1" stopColor={DIVIDER_COLOR} stopOpacity={0.2} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height={1} fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
};

export default GradientDivider;

const styles = StyleSheet.create({
  divider: {
    height: 1,
    alignSelf: "stretch",
  },
});
