import * as React from "react";
import Svg, { Circle, Path, type SvgProps } from "react-native-svg";

type PlayPauseIconProps = SvgProps & {
  isPlaying: boolean;
};

// Figma 2546:9709 (pause, while playing) and 2546:9764 (play, while paused):
// 50px #3F434C circle with the glyph centred.
const PlayPauseIcon = ({ isPlaying, ...props }: PlayPauseIconProps) => (
  <Svg width={50} height={50} viewBox="0 0 50 50" fill="none" {...props}>
    <Circle cx={25} cy={25} r={25} fill="#3F434C" />
    {isPlaying ? (
      <>
        <Path d="M19.0911 18.1819V31.8182" stroke="#EBEBEB" strokeWidth={5} strokeLinecap="round" />
        <Path d="M30.9089 18.1819V31.8182" stroke="#EBEBEB" strokeWidth={5} strokeLinecap="round" />
      </>
    ) : (
      <Path
        d="M33.7752 24.2739C34.7408 24.8061 34.7408 26.1939 33.7752 26.7261L21.5757 33.4493C20.6427 33.9635 19.5 33.2886 19.5 32.2232V18.7768C19.5 17.7114 20.6427 17.0365 21.5757 17.5507L33.7752 24.2739Z"
        fill="#E3E3E3"
      />
    )}
  </Svg>
);

export default PlayPauseIcon;
