import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

// Figma "Chevron left" (node 2919:12003)
const ChevronLeft = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M16 20L8 12L16 4"
      stroke="white"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ChevronLeft;
