import * as React from "react";
import Svg, { Defs, G, Path } from "react-native-svg";

/* SVGR has dropped some elements not supported by react-native-svg: title, desc */
const SendButton = (props) => (
  <Svg
    width="28" // Consider setting width/height via style prop for better control
    height="28" // Consider setting width/height via style prop for better control
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    // Removed xmlnsXlink and xmlns:sketch
    {...props} // Pass props like style, fill, etc. here
  >
    <Defs />
    <G
      id="Page-1"
      stroke="none"
      strokeWidth={1}
      fill="none" // The fill is applied later
      fillRule="evenodd"
      // Removed sketch:type
    >
      <G
        id="Icon-Set-Filled"
        // Removed sketch:type
        transform="translate(-570.000000, -257.000000)"
        fill="#000000" // Default fill color, can be overridden by props
      >
        <Path
          d="M580.407,278.75 C581.743,281.205 586,289 586,289 C586,289 601.75,258.5 602,258 L602.02,257.91 L580.407,278.75 L580.407,278.75 Z M570,272 C570,272 577.298,276.381 579.345,277.597 L601,257 C598.536,258.194 570,272 570,272 L570,272 Z"
          id="send-email"
          // Removed sketch:type
        />
      </G>
    </G>
  </Svg>
);
export default SendButton;
