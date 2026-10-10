import * as React from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

type BookmarkIconProps = SvgProps & {
  filled?: boolean;
};

// Figma 2546:9692: white outline bookmark. Figma has no saved state, so the
// saved state fills the same shape.
const BookmarkIcon = ({ filled = false, ...props }: BookmarkIconProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
      fill={filled ? "white" : "none"}
      stroke="white"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default BookmarkIcon;
