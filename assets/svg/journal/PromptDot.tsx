import * as React from "react";
import Svg, { Circle, type SvgProps } from "react-native-svg";

// Figma 2631:10687: 5×5 brand-yellow bullet.
const PromptDot = (props: SvgProps) => (
  <Svg width={5} height={5} viewBox="0 0 5 5" fill="none" {...props}>
    <Circle cx={2.5} cy={2.5} r={2.5} fill="#F8C63E" />
  </Svg>
);

export default PromptDot;
