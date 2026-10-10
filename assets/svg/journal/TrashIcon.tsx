import * as React from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

// Figma 2571:8769: 22×22 white trash icon on the Delete pill.
const TrashIcon = (props: SvgProps) => (
  <Svg width={22} height={22} viewBox="0 0 22 22" fill="none" {...props}>
    <Path d="M3 6L21 6" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10 10V15" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 10V15" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 6V19H18V6" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 5L9.6 3H14.4L15 5" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default TrashIcon;
