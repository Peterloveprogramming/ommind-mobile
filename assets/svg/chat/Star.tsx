import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

type StarProps = SvgProps & {
  filled?: boolean;
};

// Figma "Star" (node 2546:9873)
const Star = ({ filled = false, ...props }: StarProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M10 1.66667L12.575 6.88333L18.3333 7.725L14.1667 11.7833L15.15 17.5167L10 14.8083L4.85 17.5167L5.83333 11.7833L1.66667 7.725L7.425 6.88333L10 1.66667Z"
      fill={filled ? "#F8C63E" : "none"}
      stroke={filled ? "#F8C63E" : "#E4E4E4"}
      strokeWidth={filled ? 2 : 1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default Star;
