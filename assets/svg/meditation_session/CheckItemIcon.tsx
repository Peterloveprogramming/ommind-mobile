import * as React from "react";
import Svg, { Path, Rect, type SvgProps } from "react-native-svg";

type CheckItemIconProps = SvgProps & {
  checked: boolean;
};

// Figma 2445:8347 (completed: filled grey with tick) and 2445:8358
// (not completed: grey outline) on the course session cards.
const CheckItemIcon = ({ checked, ...props }: CheckItemIconProps) => (
  <Svg width={18} height={18} viewBox="0 0 18 18" fill="none" {...props}>
    {checked ? (
      <>
        <Rect width={18} height={18} rx={9} fill="#8E8E93" />
        <Path
          d="M13 6.5L7.5 11.5L5 9.22727"
          stroke="white"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ) : (
      <Rect
        x={0.75}
        y={0.75}
        width={16.5}
        height={16.5}
        rx={8.25}
        fill="white"
        stroke="#8E8E93"
        strokeWidth={1.5}
      />
    )}
  </Svg>
);

export default CheckItemIcon;
