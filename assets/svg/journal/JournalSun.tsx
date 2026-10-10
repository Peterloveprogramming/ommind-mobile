import * as React from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";

// Figma 2586:9081 (active: black) / 2571:8687 (inactive: #8E8E93). The
// 18.5×18.5 icon sits centred in the 20×20 Sun frame.
type JournalSunProps = SvgProps & { color?: string };

const JournalSun = ({ color = "#000000", ...props }: JournalSunProps) => (
  <Svg width={20} height={20} viewBox="-0.75 -0.75 20 20" fill="none" {...props}>
    <Path
      d="M9.25 1V2.5M9.25 16V17.5M3.415 3.415L4.48 4.48M14.02 14.02L15.085 15.085M1 9.25H2.5M16 9.25H17.5M3.415 15.085L4.48 14.02M14.02 4.48L15.085 3.415M13 9.25C13 11.3211 11.3211 13 9.25 13C7.17893 13 5.5 11.3211 5.5 9.25C5.5 7.17893 7.17893 5.5 9.25 5.5C11.3211 5.5 13 7.17893 13 9.25Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default JournalSun;
