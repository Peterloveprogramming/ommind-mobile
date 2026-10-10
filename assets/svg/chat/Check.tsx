import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

// Figma feedback success check (node 2636:10016)
const Check = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M5 12.84L8.77398 18.0707C9.1286 18.5622 9.83543 18.6278 10.2744 18.2099L21 8"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export default Check;
