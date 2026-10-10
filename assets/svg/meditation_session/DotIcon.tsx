import * as React from "react";
import Svg, { Ellipse, type SvgProps } from "react-native-svg";

// Figma 2445:8330: separator between "N Sessions" and "Guided Meditation".
const DotIcon = (props: SvgProps) => (
  <Svg width={3.24907} height={3.24224} viewBox="0 0 3.24907 3.24224" fill="none" {...props}>
    <Ellipse cx={1.62453} cy={1.62112} rx={1.62453} ry={1.62112} fill="#8B8B8B" />
  </Svg>
);

export default DotIcon;
