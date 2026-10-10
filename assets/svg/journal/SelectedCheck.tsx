import * as React from "react";
import Svg, { Path, Rect, type SvgProps } from "react-native-svg";

// Figma 2631:10309: 22×22 selected-entry indicator (brand-yellow circle + tick).
const SelectedCheck = (props: SvgProps) => (
  <Svg width={22} height={22} viewBox="0 0 22 22" fill="none" {...props}>
    <Rect x={0.5} y={0.5} width={21} height={21} rx={10.5} fill="#F8C63E" />
    <Rect x={0.5} y={0.5} width={21} height={21} rx={10.5} stroke="#F8C63E" />
    <Path
      d="M5.75 10.75L9.25 14.75L16.25 7.25"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SelectedCheck;
