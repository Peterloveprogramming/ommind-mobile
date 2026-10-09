import React, { useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";

// Figma bubble (node 2958:10104): 12 radius, 6 wide tail on the left.
export const TAIL_WIDTH = 6;
export const RADIUS = 12;
const HALF_STROKE = 0.5;
const BUBBLE_COLOR = "#FAF9F2";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>; // width / minHeight from the caller
};

type Size = { width: number; height: number };

// Built from the measured size so the corners and tail never distort.
const buildBubblePath = (w: number, h: number) => {
  const t = TAIL_WIDTH;
  const r = RADIUS;
  const s = HALF_STROKE;
  return [
    `M${t + r} ${s}`,
    `H${w - s - r}`,
    `A${r} ${r} 0 0 1 ${w - s} ${s + r}`,
    `V${h - s - r}`,
    `A${r} ${r} 0 0 1 ${w - s - r} ${h - s}`,
    `H${t + r}`,
    `A${r} ${r} 0 0 1 ${t} ${h - s - r}`,
    `V${h - 13}`,
    `L${s + 0.3} ${h - 19.5}`,
    `L${t} ${h - 24.5}`,
    `V${s + r}`,
    `A${r} ${r} 0 0 1 ${t + r} ${s}`,
    "Z",
  ].join(" ");
};

const SpeechBubble = ({ children, style }: Props) => {
  const [size, setSize] = useState<Size | null>(null);

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    const height = Math.round(event.nativeEvent.layout.height);
    setSize((current) =>
      current && current.width === width && current.height === height
        ? current
        : { width, height }
    );
  };

  const path = useMemo(
    () => (size ? buildBubblePath(size.width, size.height) : null),
    [size]
  );

  return (
    <View style={[styles.bubble, style]} onLayout={handleLayout}>
      {size && path ? (
        <Svg
          width={size.width}
          height={size.height}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          accessible={false}
        >
          <Path
            d={path}
            fill={BUBBLE_COLOR}
            fillOpacity={0.38}
            stroke={BUBBLE_COLOR}
            strokeWidth={1}
          />
        </Svg>
      ) : null}
      {children}
    </View>
  );
};

export default SpeechBubble;

const styles = StyleSheet.create({
  bubble: {
    minHeight: 61,
    justifyContent: "center",
    paddingLeft: TAIL_WIDTH + 7,
    paddingRight: 6,
    paddingVertical: 5,
  },
});
