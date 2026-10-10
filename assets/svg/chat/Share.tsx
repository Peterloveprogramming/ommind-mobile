import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

// Figma "Share" (node 2631:11291)
const Share = (props: SvgProps) => (
  <Svg width={24} height={22} viewBox="0 0 24 22" fill="none" {...props}>
    <Path
      d="M4 11V18.3333C4 18.8196 4.21071 19.2859 4.58579 19.6297C4.96086 19.9735 5.46957 20.1667 6 20.1667H18C18.5304 20.1667 19.0391 19.9735 19.4142 19.6297C19.7893 19.2859 20 18.8196 20 18.3333V11M8 5.5L12 1.83333L16 5.5M12 1.83333V13.75"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default Share;
