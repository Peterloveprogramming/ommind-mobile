import * as React from "react";
import Svg, { Path } from "react-native-svg";
const Home = ({color = "white",...props}) => (
  <Svg
    width={37}
    height={36}
    viewBox="0 0 37 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M27.875 19.0417V29.4584H21.625V23.2084H15.375V29.4584H9.125V19.0417H6L18.5 6.54169L31 19.0417H27.875ZM26.8333 12.8886V7.58335H23.7083V9.76356L26.8333 12.8886Z"
      fill={color}
    />
  </Svg>
);
export default Home;
