import * as React from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

// Figma 3079:10389: 9×5 chevron (10×6.25 with stroke overflow).
const ChevronDown = (props: SvgProps) => (
  <Svg width={10} height={6.24743} viewBox="0 0 10 6.24743" fill="none" {...props}>
    <Path d="M0.500004 0.500004L5 5.5L9.5 0.500004" stroke="black" strokeLinecap="round" />
  </Svg>
);

export default ChevronDown;
