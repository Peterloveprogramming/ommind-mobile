import * as React from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

// Figma 2546:9679: the 24×24 "Plus" icon rotated 45° inside the player's close button.
const CloseIcon = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 3V21M3 12H21"
      stroke="white"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      transform="rotate(45 12 12)"
    />
  </Svg>
);

export default CloseIcon;
