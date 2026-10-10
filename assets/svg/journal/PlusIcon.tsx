import * as React from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

// Figma 2586:9066: white plus on Start Writing. The 16.5×16.5 vector overhangs
// its 16×16 frame by 0.25 on each side, as in Figma.
const PlusIcon = (props: SvgProps) => (
  <Svg width={16.5} height={16.5} viewBox="0 0 16.5 16.5" fill="none" {...props}>
    <Path
      d="M8.25 1.25V15.25M1.25 8.25H15.25"
      stroke="white"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default PlusIcon;
