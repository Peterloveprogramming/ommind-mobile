import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

type BookmarkProps = SvgProps & {
  filled?: boolean;
};

// Figma bookmark action (node 2631:11286)
const Bookmark = ({ filled = false, ...props }: BookmarkProps) => (
  <Svg width={23} height={23} viewBox="0 0 23 23" fill="none" {...props}>
    <Path
      d="M18 20.5L11.5 15.7778L5 20.5V5.38889C5 4.88792 5.19566 4.40748 5.54394 4.05324C5.89223 3.69901 6.3646 3.5 6.85714 3.5H16.1429C16.6354 3.5 17.1078 3.69901 17.4561 4.05324C17.8043 4.40748 18 4.88792 18 5.38889V20.5Z"
      fill={filled ? "white" : "none"}
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default Bookmark;
