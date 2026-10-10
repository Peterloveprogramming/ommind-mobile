import * as React from "react";
import Svg, { Path, Rect, SvgProps } from "react-native-svg";

// Figma sheet close button (node 2631:11316)
const CloseCircle = (props: SvgProps) => (
  <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
    <Rect width={28} height={28} rx={14} fill="white" fillOpacity={0.25} />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14 14.7579L9.915 18.8436C9.81071 18.9479 9.67286 19 9.53571 19C9.24714 19 9 18.7686 9 18.465C9 18.3271 9.05214 18.19 9.15643 18.085L13.2421 14L9.15714 9.915C9.05214 9.81 9 9.67286 9 9.53571C9 9.23071 9.24929 9 9.53571 9C9.67286 9 9.81071 9.05214 9.915 9.15643L14 13.2414L18.085 9.15643C18.1893 9.05214 18.3271 9 18.4643 9C18.7507 9 19 9.23071 19 9.53571C19 9.67286 18.9479 9.81 18.8429 9.915L14.7579 14L18.8436 18.085C18.9479 18.19 19 18.3271 19 18.465C19 18.7686 18.7529 19 18.4643 19C18.3271 19 18.1893 18.9479 18.085 18.8436L14 14.7579Z"
      fill="white"
      stroke="white"
    />
  </Svg>
);

export default CloseCircle;
