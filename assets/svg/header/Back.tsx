import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";
import { Platform } from "react-native"; // 1. Import Platform

const Back = (props) => (
  <Svg
  width={Platform.OS === 'ios' ? 41 : 49}
  height={Platform.OS === 'ios' ? 40 : 48}
  viewBox="0 0 49 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect
      x={0.5}
      width={48}
      height={48}
      rx={24}
      fill="#474747"
      fillOpacity={0.35}
    />
    <Path
      d="M28.5 32L20.5 24L28.5 16"
      stroke="white"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default Back;
