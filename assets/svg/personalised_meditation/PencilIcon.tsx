import * as React from "react";
import Svg, { G, Mask, Path, SvgProps } from "react-native-svg";

// Figma edit focus pencil (node 3151:10455)
const PencilIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M8.41177 17.9412L1.00001 19L2.05883 11.5882L12.6471 1L19 7.35294L8.41177 17.9412ZM2.05883 11.5882L8.41177 17.9412"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <G>
      <Mask id="pencil-tip-mask" fill="white">
        <Path d="M4.31742 18.0526L2.00168 16L1.47531 19L4.31742 18.0526Z" />
      </Mask>
      <Path
        d="M2.00168 16L3.32831 14.5033L0.650228 12.1295L0.0317721 15.6544L2.00168 16ZM4.31742 18.0526L4.94987 19.95L8.23699 18.8543L5.64405 16.556L4.31742 18.0526ZM1.47531 19L-0.494595 18.6544L-1.07424 21.958L2.10777 20.8974L1.47531 19ZM2.00168 16L0.675048 17.4967L2.99079 19.5493L4.31742 18.0526L5.64405 16.556L3.32831 14.5033L2.00168 16ZM4.31742 18.0526L3.68496 16.1553L0.842858 17.1026L1.47531 19L2.10777 20.8974L4.94987 19.95L4.31742 18.0526ZM1.47531 19L3.44522 19.3456L3.97159 16.3456L2.00168 16L0.0317721 15.6544L-0.494595 18.6544L1.47531 19Z"
        fill="white"
        mask="url(#pencil-tip-mask)"
      />
    </G>
  </Svg>
);

export default PencilIcon;
