import { useContext } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BottomTabBarHeightCallbackContext } from "@react-navigation/bottom-tabs";
import { useKeyboardState } from "react-native-keyboard-controller";
import Home from "@/assets/svg/Home";
import Explore from "@/assets/svg/Explore";
import Journal from "@/assets/svg/Journal";
import Profile from "@/assets/svg/Profile";
import { BottomNavVisibilityContext } from "@/context/BottomNavVisibilityContext";
import { FONTS } from "@/theme.js";
import LhamoTabButton from "@/comp/navigation/LhamoTabButton";
import TabBarBackground from "@/comp/navigation/TabBarBackground";
import {
  TAB_BAR,
  getTabBarBackgroundHeight,
  getTabBarSidePadding,
} from "@/comp/navigation/tabBarMetrics";

// Rendered from a fixed list because the navigator also holds hidden routes
// (lhamo, saved, recently-played).
const TABS = [
  { name: "index",   label: "Home",    Icon: Home },
  { name: "explore", label: "Explore", Icon: Explore },
  { name: "journal", label: "Journal", Icon: Journal },
  { name: "profile", label: "Profile", Icon: Profile },
] as const;

type Tab = (typeof TABS)[number];

// Routes that keep Profile highlighted.
const PROFILE_CHILD_ROUTES = ["saved", "recently-played"];

type TabItemProps = Pick<BottomTabBarProps, "state" | "descriptors" | "navigation"> & {
  tab: Tab;
};

const TabItem = ({ tab, state, descriptors, navigation }: TabItemProps) => {
  const route = state.routes.find((r) => r.name === tab.name);
  if (!route) {
    return null;
  }

  const focusedName = state.routes[state.index].name;
  const isFocused = focusedName === route.name;
  const active =
    isFocused || (tab.name === "profile" && PROFILE_CHILD_ROUTES.includes(focusedName));
  const color = active ? TAB_BAR.ACTIVE_COLOR : TAB_BAR.INACTIVE_COLOR;
  const { Icon } = tab;

  const onPress = () => {
    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
  };
  const onLongPress = () => navigation.emit({ type: "tabLongPress", target: route.key });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel ?? tab.label}
      testID={`tab-${tab.name}`}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
    >
      <View style={styles.iconBox}>
        <Icon color={color} />
      </View>
      <Text style={[styles.label, { color }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
        {tab.label}
      </Text>
    </Pressable>
  );
};

const AppTabBar = ({ state, descriptors, navigation, insets }: BottomTabBarProps) => {
  const { width } = useWindowDimensions();
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);
  const bottomNavVisibility = useContext(BottomNavVisibilityContext);
  const isKeyboardVisible = useKeyboardState((s) => s.isVisible);

  if (bottomNavVisibility?.isVisible === false || isKeyboardVisible) {
    return null;
  }

  const backgroundHeight = getTabBarBackgroundHeight(insets.bottom);
  const sidePadding = getTabBarSidePadding(width);
  const [home, explore, journal, profile] = TABS.map((tab) => (
    <TabItem
      key={tab.name}
      tab={tab}
      state={state}
      descriptors={descriptors}
      navigation={navigation}
    />
  ));

  return (
    <View
      pointerEvents="box-none"
      onLayout={(e) => onHeightChange?.(e.nativeEvent.layout.height)}
      style={[styles.root, { height: TAB_BAR.ORB_OVERHANG + backgroundHeight }]}
    >
      <View pointerEvents="none" style={styles.background}>
        <TabBarBackground width={width} height={backgroundHeight} />
      </View>
      <View pointerEvents="box-none" accessibilityRole="tablist" style={styles.contentRow}>
        <View style={[styles.group, { paddingLeft: sidePadding }]}>
          {home}
          {explore}
        </View>
        <View style={styles.centerSlot} />
        <View style={[styles.group, { paddingRight: sidePadding }]}>
          {journal}
          {profile}
        </View>
      </View>
      <LhamoTabButton />
    </View>
  );
};

export default AppTabBar;

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentRow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: TAB_BAR.ORB_OVERHANG,
    paddingTop: TAB_BAR.CONTENT_TOP_PADDING,
    flexDirection: "row",
  },
  group: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  centerSlot: {
    width: TAB_BAR.CENTER_SLOT_WIDTH,
  },
  item: {
    width: TAB_BAR.ITEM_WIDTH,
    height: TAB_BAR.ITEM_HEIGHT,
    flexShrink: 1,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  iconBox: {
    height: TAB_BAR.ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: FONTS.inter,
    fontSize: TAB_BAR.LABEL_FONT_SIZE,
    lineHeight: TAB_BAR.LABEL_LINE_HEIGHT,
    textAlign: "center",
    marginTop: TAB_BAR.ICON_LABEL_GAP,
  },
});
