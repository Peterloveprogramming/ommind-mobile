import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { images } from "@/constants/images";
import { navigateToNewChat } from "@/utils/helper";
import { FONTS } from "@/theme.js";
import { TAB_BAR } from "@/comp/navigation/tabBarMetrics";

const LABEL_TOP =
  TAB_BAR.ORB_OVERHANG + TAB_BAR.CONTENT_TOP_PADDING + TAB_BAR.ICON_SIZE + TAB_BAR.ICON_LABEL_GAP;
const SHADOW_OFFSET = (TAB_BAR.ORB_IMAGE_SIZE - TAB_BAR.ORB_SPHERE_SIZE) / 2;

// Center column of the tab bar: the Lhamo orb plus its label. Opens a new chat.
const LhamoTabButton = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const handlePress = () => {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);
    setTimeout(() => {
      setIsNavigating(false);
    }, 1500);

    navigateToNewChat(router);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isNavigating}
      accessibilityRole="button"
      accessibilityLabel="Lhamo"
      accessibilityHint="Starts a new chat with Lhamo"
      accessibilityState={{ disabled: isNavigating, busy: isNavigating }}
      testID="tab-lhamo"
      style={({ pressed }) => [styles.container, pressed && !isNavigating && styles.pressed]}
    >
      <View style={styles.orbShadow} />
      <Image
        source={images.rinpoche_normal}
        resizeMode="contain"
        style={[styles.orbImage, isNavigating && styles.orbImageDisabled]}
      />
      {isNavigating ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#FFFFFF" size="small" />
        </View>
      ) : null}
      <Text style={styles.label} numberOfLines={1} maxFontSizeMultiplier={1.2}>
        Lhamo
      </Text>
    </Pressable>
  );
};

export default LhamoTabButton;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    width: TAB_BAR.ORB_IMAGE_SIZE,
    height: LABEL_TOP + TAB_BAR.LABEL_LINE_HEIGHT,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  orbShadow: {
    position: "absolute",
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    width: TAB_BAR.ORB_SPHERE_SIZE,
    height: TAB_BAR.ORB_SPHERE_SIZE,
    borderRadius: TAB_BAR.ORB_SPHERE_SIZE / 2,
    boxShadow: "0 0 5px rgba(0, 0, 0, 0.2)",
  },
  orbImage: {
    width: TAB_BAR.ORB_IMAGE_SIZE,
    height: TAB_BAR.ORB_IMAGE_SIZE,
  },
  orbImageDisabled: {
    opacity: 0.6,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: TAB_BAR.ORB_IMAGE_SIZE,
    height: TAB_BAR.ORB_IMAGE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    position: "absolute",
    top: LABEL_TOP,
    left: 0,
    right: 0,
    fontFamily: FONTS.inter,
    fontSize: TAB_BAR.LABEL_FONT_SIZE,
    lineHeight: TAB_BAR.LABEL_LINE_HEIGHT,
    textAlign: "center",
    color: TAB_BAR.INACTIVE_COLOR,
  },
});
