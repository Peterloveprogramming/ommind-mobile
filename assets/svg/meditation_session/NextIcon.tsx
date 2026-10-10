import * as React from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

// Figma 2546:9713 "Next-Icon": skip to next session.
const NextIcon = (props: SvgProps) => (
  <Svg width={24.0007} height={24} viewBox="0 0 24.0007 24" fill="none" {...props}>
    <Path
      d="M20.0007 11.134C20.6674 11.5189 20.6674 12.4811 20.0007 12.866L7.99964 19.7949C7.33297 20.1798 6.49964 19.6986 6.49964 18.9288L6.49964 5.07117C6.49964 4.30137 7.33297 3.82024 7.99964 4.20514L20.0007 11.134Z"
      fill="#E3E3E3"
    />
    <Path d="M22.5007 5.86748V18.1325" stroke="#E6E6E6" strokeWidth={3} strokeLinecap="round" />
  </Svg>
);

export default NextIcon;
