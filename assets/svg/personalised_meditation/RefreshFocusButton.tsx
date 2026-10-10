import * as React from "react";
import Svg, { Path, Rect, SvgProps } from "react-native-svg";

// Figma refresh focus button (node 3140:10765)
const RefreshFocusButton = (props: SvgProps) => (
  <Svg width={33} height={33} viewBox="0 0 33 33" fill="none" {...props}>
    <Rect width={33} height={33} rx={16.5} fill="#A3A3A1" />
    <Path
      d="M8.65075 14.3281C9.7723 8.71999 18.7452 6.10289 23.7412 12.9068"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M23.7417 8.84218L23.9343 12.373C23.9607 12.8556 23.638 13.288 23.1679 13.4002L19.903 14.1792"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M24.2894 19.2801C23.2894 24.9112 14.3752 27.7217 9.2332 21.0274"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M9.32044 25.0911L9.08039 21.5168C9.04799 21.0345 9.36525 20.5981 9.83404 20.4801L13.0428 19.6724"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export default RefreshFocusButton;
