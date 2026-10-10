import * as React from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

// Figma 2546:9706 "Back-Icon": skip to previous session.
const PreviousIcon = (props: SvgProps) => (
  <Svg width={24.0007} height={24} viewBox="0 0 24.0007 24" fill="none" {...props}>
    <Path d="M1.5 5.86748V18.1325" stroke="#E6E6E6" strokeWidth={3} strokeLinecap="round" />
    <Path
      d="M4 11.134C3.33333 11.5189 3.33333 12.4811 4 12.866L16.0011 19.7949C16.6678 20.1798 17.5011 19.6986 17.5011 18.9288V5.07117C17.5011 4.30137 16.6678 3.82024 16.0011 4.20514L4 11.134Z"
      fill="#E3E3E3"
    />
  </Svg>
);

export default PreviousIcon;
