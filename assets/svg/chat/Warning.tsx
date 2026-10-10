import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

// Figma report action icon (node 2631:11309)
const Warning = (props: SvgProps) => (
  <Svg width={23} height={23} viewBox="0 0 23 23" fill="none" {...props}>
    <Path
      d="M1.87726 18.4961L10.6362 3.48076C11.0221 2.81926 11.9779 2.81926 12.3638 3.48076L21.1227 18.4961C21.5116 19.1628 21.0308 20 20.259 20H2.74104C1.96925 20 1.48837 19.1628 1.87726 18.4961Z"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path d="M11.5 8.35429V14" stroke="white" strokeWidth={2} strokeLinecap="round" />
    <Path d="M11.5 17V17.5" stroke="white" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export default Warning;
