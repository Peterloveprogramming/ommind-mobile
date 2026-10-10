import ChevronLeft from "@/assets/svg/chat/ChevronLeft";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Figma 37GSSpgSU44KPNvLuVKAOw node 2113:6816 ("Top NavigationBar").
// Drawn in-screen instead of the native stack header so it looks identical on
// iOS (no liquid-glass capsule) and Android, on every screen size.
const HEADER_UI = {
  gutter: 23,
  buttonSize: 48,
  // Nav bar sits 7pt above the bottom of the status bar (52 vs 59 in Figma).
  topOffset: -7,
  minTop: 12,
  // Keeps the content below at the same height the native header left it.
  bottomGap: 4,
} as const;

type BackHeaderProps = {
  onBack: () => void;
  backgroundColor?: string;
};

const BackHeader = ({ onBack, backgroundColor = "transparent" }: BackHeaderProps) => {
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(insets.top + HEADER_UI.topOffset, HEADER_UI.minTop);

  return (
    <View style={[styles.header, { paddingTop, backgroundColor }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        onPress={onBack}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <ChevronLeft />
      </Pressable>
    </View>
  );
};

export default BackHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: HEADER_UI.gutter,
    paddingBottom: HEADER_UI.bottomGap,
  },
  button: {
    width: HEADER_UI.buttonSize,
    height: HEADER_UI.buttonSize,
    borderRadius: HEADER_UI.buttonSize / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(71, 71, 71, 0.3)",
  },
  pressed: {
    opacity: 0.7,
  },
});
