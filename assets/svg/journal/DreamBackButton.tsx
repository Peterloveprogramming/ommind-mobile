import * as React from "react";
import Svg, { G, Path, type SvgProps } from "react-native-svg";

// Figma 3128:10003 "CreateButton": 52×52 on both platforms.
const DreamBackButton = (props: SvgProps) => (
  <Svg width={52} height={52} viewBox="0 0 52 52" fill="none" {...props}>
    <G>
      <Path
        d="M0 25C0 11.1929 11.1929 0 25 0H27C40.8071 0 52 11.1929 52 25V27C52 40.8071 40.8071 52 27 52H25C11.1929 52 0 40.8071 0 27V25Z"
        fill="#474747"
        fillOpacity={0.3}
      />
      <Path
        d="M21.4167 34L15 25.9986L21.4167 18M15 25.9986H37"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  </Svg>
);

export default DreamBackButton;
