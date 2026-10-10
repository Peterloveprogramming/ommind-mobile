import * as React from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

// Figma 2571:8778: 22×22 white export icon on the Export pill.
const ExportIcon = (props: SvgProps) => (
  <Svg width={22} height={22} viewBox="0 0 22 22" fill="none" {...props}>
    <Path
      d="M18 5.90909V3H4V19H18V16.5758"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M13 3V19" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path
      d="M15 11.5H20M18 14L20 11.5L18 9"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ExportIcon;
