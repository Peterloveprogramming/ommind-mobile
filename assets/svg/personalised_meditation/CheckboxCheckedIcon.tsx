import * as React from "react";
import Svg, { Path, Rect, SvgProps } from "react-native-svg";

// Figma "Personalise using this conversation" checked box (node 3151:10466)
const CheckboxCheckedIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Rect width={20} height={20} rx={2} fill="white" />
    <Path
      d="M4.5 11L8.84423 15.3442C8.92772 15.4277 9.06498 15.4211 9.14004 15.33L16 7"
      stroke="#F8C63E"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

export default CheckboxCheckedIcon;
