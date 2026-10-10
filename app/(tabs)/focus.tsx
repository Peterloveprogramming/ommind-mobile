import { useUserApi } from "@/api/api";
import FocusCheck from "@/assets/svg/profile/FocusCheck";
import FocusPlanet from "@/assets/svg/profile/FocusPlanet";
import ProfileScreenHeader, { PROFILE_HEADER_UI } from "@/comp/profile/ProfileScreenHeader";
import { FONTS } from "@/theme";
import { checkIfLambdaResultIsSuccess, getLambdaErrorMessage } from "@/utils/helper";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Figma "Profile / Your focus" frame 2906:9566 (Pro copy 37GSSpgSU44KPNvLuVKAOw), in pt.
const FOCUS_UI = {
  background: "#FAFAFA",
  iconWrapSize: 44,
  iconWrapColor: "rgba(217, 217, 217, 0.3)",
  iconTitleGap: 9,
  headingListGap: 30,
  rowHeight: 44,
  rowGap: 8,
  rowRadius: 5,
  rowPaddingHorizontal: 20,
  rowColor: "#E5E5EA",
  labelColor: "#636366",
  indicatorSize: 22,
  indicatorBorderColor: "#C4C4C4",
  bottomSpacing: 24,
} as const;

const MAX_SELECTED_FOCUS_ITEMS = 5;
const FOCUS_OPTIONS = [
  "Calm",
  "Sleep well",
  "Release",
  "Healing",
  "Compassion",
  "Clarity",
  "Awareness",
  "Strength",
  "Discipline",
  "Energy",
  "Presence",
  "Integration",
  "Transcendence",
];

type FocusParams = {
  // JSON-encoded string[] of the user's current focus, passed from the Profile tab.
  current_focus?: string;
};

const parseFocusParam = (value: string | undefined): string[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
};

const hasSameItems = (a: string[], b: string[]) =>
  a.length === b.length && a.every((item) => b.includes(item));

const Focus = () => {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const params = useLocalSearchParams<FocusParams>();
  const {
    updateUserCurrentFocus: { updateUserCurrentFocus },
  } = useUserApi();
  const initialFocusItems = React.useMemo(
    () => parseFocusParam(params.current_focus),
    [params.current_focus]
  );
  const [selectedFocusItems, setSelectedFocusItems] = React.useState<string[]>(initialFocusItems);
  const [isSaving, setIsSaving] = React.useState(false);

  // Tab screens stay mounted, so re-sync with the latest saved focus every time this screen opens.
  useFocusEffect(
    React.useCallback(() => {
      setSelectedFocusItems(initialFocusItems);
    }, [initialFocusItems])
  );

  const handleToggleFocus = (focus: string) => {
    if (isSaving) {
      return;
    }

    if (selectedFocusItems.includes(focus)) {
      setSelectedFocusItems(selectedFocusItems.filter((item) => item !== focus));
      return;
    }

    if (selectedFocusItems.length >= MAX_SELECTED_FOCUS_ITEMS) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    void Haptics.selectionAsync();
    setSelectedFocusItems([...selectedFocusItems, focus]);
  };

  const leaveScreen = React.useCallback(() => {
    router.replace("/profile");
  }, [router]);

  // The design has no confirm button, so changes are saved when the user leaves the screen.
  const handleBackPress = React.useCallback(async () => {
    if (isSaving) {
      return;
    }

    if (hasSameItems(selectedFocusItems, initialFocusItems)) {
      leaveScreen();
      return;
    }

    setIsSaving(true);

    try {
      const updateResult = await updateUserCurrentFocus({
        current_focus: selectedFocusItems,
      });

      if (!checkIfLambdaResultIsSuccess(updateResult)) {
        throw new Error(getLambdaErrorMessage(updateResult));
      }

      leaveScreen();
    } catch (error) {
      console.error("Failed to update current focus", error);
      Alert.alert(
        "Unable to update focus",
        error instanceof Error && error.message ? error.message : "Please try again.",
        [
          { text: "Discard changes", style: "destructive", onPress: leaveScreen },
          { text: "Keep editing", style: "cancel" },
        ]
      );
    } finally {
      setIsSaving(false);
    }
  }, [initialFocusItems, isSaving, leaveScreen, selectedFocusItems, updateUserCurrentFocus]);

  useFocusEffect(
    React.useCallback(() => {
      const backSubscription = BackHandler.addEventListener("hardwareBackPress", () => {
        void handleBackPress();
        return true;
      });

      return () => backSubscription.remove();
    }, [handleBackPress])
  );

  return (
    <View style={styles.container}>
      <ProfileScreenHeader onBackPress={() => void handleBackPress()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarHeight + FOCUS_UI.bottomSpacing },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <View style={styles.iconWrap}>
            <FocusPlanet />
          </View>
          <Text
            accessibilityRole="header"
            maxFontSizeMultiplier={PROFILE_HEADER_UI.maxFontSizeMultiplier}
            style={styles.title}
          >
            Your focus
          </Text>
        </View>

        <View style={styles.list}>
          {FOCUS_OPTIONS.map((focus) => {
            const isSelected = selectedFocusItems.includes(focus);

            return (
              <Pressable
                key={focus}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected, disabled: isSaving }}
                accessibilityLabel={focus}
                disabled={isSaving}
                onPress={() => handleToggleFocus(focus)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <Text
                  maxFontSizeMultiplier={PROFILE_HEADER_UI.maxFontSizeMultiplier}
                  numberOfLines={1}
                  style={styles.label}
                >
                  {focus}
                </Text>
                {isSelected ? <FocusCheck /> : <View style={styles.indicator} />}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {isSaving ? (
        <View style={styles.savingOverlay} pointerEvents="none">
          <ActivityIndicator color="#B88A1A" size="large" />
        </View>
      ) : null}
    </View>
  );
};

export default Focus;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FOCUS_UI.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: PROFILE_HEADER_UI.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: PROFILE_HEADER_UI.gutter,
    gap: FOCUS_UI.headingListGap,
  },
  heading: {
    alignItems: "center",
    gap: FOCUS_UI.iconTitleGap,
  },
  iconWrap: {
    width: FOCUS_UI.iconWrapSize,
    height: FOCUS_UI.iconWrapSize,
    borderRadius: FOCUS_UI.iconWrapSize / 2,
    backgroundColor: FOCUS_UI.iconWrapColor,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 20,
    lineHeight: 20,
    color: "#000000",
    textAlign: "center",
    includeFontPadding: false,
  },
  list: {
    gap: FOCUS_UI.rowGap,
  },
  row: {
    minHeight: FOCUS_UI.rowHeight,
    borderRadius: FOCUS_UI.rowRadius,
    backgroundColor: FOCUS_UI.rowColor,
    paddingHorizontal: FOCUS_UI.rowPaddingHorizontal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  label: {
    flexShrink: 1,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 16,
    lineHeight: 20,
    color: FOCUS_UI.labelColor,
    includeFontPadding: false,
  },
  indicator: {
    width: FOCUS_UI.indicatorSize,
    height: FOCUS_UI.indicatorSize,
    borderRadius: FOCUS_UI.indicatorSize / 2,
    borderWidth: 1.5,
    borderColor: FOCUS_UI.indicatorBorderColor,
  },
  pressed: {
    opacity: 0.8,
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
