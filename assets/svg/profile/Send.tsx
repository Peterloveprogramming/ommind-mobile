import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

// Figma "Send" (node 2919:12068)
const Send = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M18.3333 1.66667L9.16667 10.8333M9.16667 10.8333L1.66667 7.5L18.3333 1.66667L12.5 18.3333L9.16667 10.8333Z"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default Send;
