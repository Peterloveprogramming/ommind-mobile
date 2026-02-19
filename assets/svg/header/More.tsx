import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";
import { Platform } from "react-native";
const More = (props) => (
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
      d="M16.5 24V32C16.5 32.5304 16.7107 33.0391 17.0858 33.4142C17.4609 33.7893 17.9696 34 18.5 34H30.5C31.0304 34 31.5391 33.7893 31.9142 33.4142C32.2893 33.0391 32.5 32.5304 32.5 32V24M28.5 18L24.5 14M24.5 14L20.5 18M24.5 14V27"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default More;
