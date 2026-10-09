import * as React from "react";
import Svg, { G, Path, SvgProps } from "react-native-svg";
// Figma: OmMind copy, node 2684:9667
const NewChatButton = (props: SvgProps) => (
  <Svg
    width={30}
    height={30}
    viewBox="0 0 30 30"
    fill="none"
    {...props}
  >
    <G>
      <Path
        d="M20 9H25"
        stroke="#383838"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22.5 6V12"
        stroke="#383838"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22.4 14.9158V20.1368H14.3652L11.0174 23.4L9.67826 20.1368H7V11H17.713"
        stroke="#383838"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  </Svg>
);
export default NewChatButton;
