import * as React from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

// Figma 2546:9705: slash drawn over the loop icon when loop is off.
const LoopSlash = (props: SvgProps) => (
  <Svg width={23} height={22} viewBox="0 0 23 22" fill="none" {...props}>
    <Path d="M1 1L22 21" stroke="#D0CDCB" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export default LoopSlash;
