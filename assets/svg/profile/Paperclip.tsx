import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

// Figma "Add an image" paperclip (node 2919:12071)
const Paperclip = (props: SvgProps) => (
  <Svg width={23} height={23} viewBox="0 0 23 23" fill="none" {...props}>
    <Path
      d="M15 10L12.805 18.7799C12.6048 19.5808 12.229 20.3432 11.5942 20.871C9.99294 22.2025 7.71162 23.0306 6.04401 19.7762C5.63075 18.9697 5.59388 18.0306 5.77161 17.142L8.33014 4.34928C8.44254 3.78728 8.63577 3.23639 8.98893 2.785C10.3195 1.0844 12.147 0.575988 13.4841 3.23462C13.8856 4.03273 13.9013 4.96073 13.7141 5.83426L11.352 16.8574C11.1236 17.9232 10.6207 19.0937 9.55565 19.3256C9.04542 19.4366 8.52188 19.315 8.07649 18.7163C7.54814 18.0062 7.60336 17.0452 7.79952 16.1821L10 6.5"
      stroke="#8F8F8F"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

export default Paperclip;
