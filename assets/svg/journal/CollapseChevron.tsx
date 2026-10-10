import * as React from "react";
import Svg, { G, Path, type SvgProps } from "react-native-svg";

// Figma 3130:10217: 334×15 frame with a 9×5 chevron-up at its centre. The
// caller centres it, so on cards narrower than 334 only empty edges overflow.
const CollapseChevron = (props: SvgProps) => (
  <Svg width={334} height={15} viewBox="0 0 334 15" fill="none" {...props}>
    <G>
      <Path d="M162.5 10L167 5L171.5 10" stroke="black" strokeLinecap="round" />
    </G>
  </Svg>
);

export default CollapseChevron;
