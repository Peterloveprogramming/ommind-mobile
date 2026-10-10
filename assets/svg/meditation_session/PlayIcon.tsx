import * as React from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

// Figma 2445:8339: white play glyph inside the course screen's Play button.
const PlayIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M4.16667 2.5L15.8333 10L4.16667 17.5V2.5Z"
      fill="white"
      stroke="white"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default PlayIcon;
