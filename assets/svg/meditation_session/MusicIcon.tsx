import * as React from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

type MusicIconProps = SvgProps & {
  enabled: boolean;
};

// Figma 2546:9718 (background music on) and 2546:9772 (off, adds the slash).
const MusicIcon = ({ enabled, ...props }: MusicIconProps) => (
  <Svg width={23.1299} height={22} viewBox="0 0 23.1299 22" fill="none" {...props}>
    <Path d="M7.53955 8.36365L19.5395 6.36365" stroke="#E3E3E3" strokeWidth={2} />
    {enabled ? null : (
      <Path d="M1.12994 1L22.1299 21" stroke="#E3E3E3" strokeWidth={2} strokeLinecap="round" />
    )}
    <Path
      d="M7.88476 15.8636V5.28667C7.88476 4.79995 8.23521 4.38391 8.71486 4.30121L18.7149 2.57708C19.326 2.4717 19.8848 2.94233 19.8848 3.56254V14.8636"
      stroke="#E3E3E3"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M20.0788 16.352C20.0788 18.285 18.5118 19.852 16.5788 19.852C14.6458 19.852 13.0788 18.285 13.0788 16.352C13.0788 14.419 14.6458 12.852 16.5788 12.852C18.5118 12.852 20.0788 14.419 20.0788 16.352Z"
      stroke="#E3E3E3"
      strokeWidth={2}
    />
    <Path
      d="M8 16.852C8 18.785 6.433 20.352 4.5 20.352C2.567 20.352 1 18.785 1 16.852C1 14.919 2.567 13.352 4.5 13.352C6.433 13.352 8 14.919 8 16.852Z"
      stroke="#E3E3E3"
      strokeWidth={2}
    />
  </Svg>
);

export default MusicIcon;
