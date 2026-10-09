import { useMemo } from "react";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { TAB_BAR } from "@/comp/navigation/tabBarMetrics";

type TabBarBackgroundProps = {
  width: number;
  height: number;
};

// Figma `Subtract` shape (node 2423:9565): rounded top corners and a fixed-size
// centered notch. Only the flat parts stretch with the width.
const buildTabBarPath = (W: number, H: number) => {
  const c = W / 2;
  const R = TAB_BAR.CORNER_RADIUS;
  return [
    `M0 ${H}`,
    `L0 ${R}`,
    `A${R} ${R} 0 0 1 ${R} 0`,
    `L${c - 65.8} 0`,
    `C${c - 55.4} 0 ${c - 46.5} 7.2 ${c - 44.2} 17.3`,
    `C${c - 39.7} 37.5 ${c - 21.8} 51.9 ${c - 1.1} 51.9`,
    `L${c + 1.1} 51.9`,
    `C${c + 21.8} 51.9 ${c + 39.7} 37.5 ${c + 44.2} 17.3`,
    `C${c + 46.5} 7.2 ${c + 55.4} 0 ${c + 65.8} 0`,
    `L${W - R} 0`,
    `A${R} ${R} 0 0 1 ${W} ${R}`,
    `L${W} ${H}`,
    "Z",
  ].join(" ");
};

const TabBarBackground = ({ width, height }: TabBarBackgroundProps) => {
  const path = useMemo(() => buildTabBarPath(width, height), [width, height]);
  const c = width / 2;

  return (
    <Svg width={width} height={height} pointerEvents="none">
      <Defs>
        <LinearGradient
          id="omTabBarGradient"
          x1={c}
          y1={-17.14}
          x2={c}
          y2={106.06}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0} stopColor={TAB_BAR.GRADIENT_TOP} stopOpacity={TAB_BAR.GRADIENT_TOP_OPACITY} />
          <Stop offset={1} stopColor={TAB_BAR.GRADIENT_BOTTOM} stopOpacity={TAB_BAR.GRADIENT_BOTTOM_OPACITY} />
        </LinearGradient>
      </Defs>
      <Path d={path} fill="url(#omTabBarGradient)" />
    </Svg>
  );
};

export default TabBarBackground;
