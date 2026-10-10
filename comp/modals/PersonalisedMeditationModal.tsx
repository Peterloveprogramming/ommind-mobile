import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FONTS } from "@/theme";
import RefreshFocusButton from "@/assets/svg/personalised_meditation/RefreshFocusButton";
import PencilIcon from "@/assets/svg/personalised_meditation/PencilIcon";
import CheckboxCheckedIcon from "@/assets/svg/personalised_meditation/CheckboxCheckedIcon";
import LotusSparkleIcon from "@/assets/svg/personalised_meditation/LotusSparkleIcon";

export type PersonalisedMeditationSelection = {
  focus: string;
  length: string;
  style: string;
  personaliseUsingConversation: boolean;
};

type PersonalisedMeditationModalProps = {
  visible: boolean;
  initialFocus?: string;
  showPersonaliseUsingConversation?: boolean;
  onClose: () => void;
  onBegin?: (selection: PersonalisedMeditationSelection) => void;
};

const FOCUS_OPTIONS = [
  "Calm the mind",
  "Reduce stress",
  "Improve sleep",
  "Feel grounded",
  "Build self-compassion",
  "Find focus",
];
const LENGTH_OPTIONS = ["2 min", "5 min"];
const STYLE_OPTIONS = [
  "Gentle",
  "Reflective",
  "Breath-led",
  "Body scan",
  "Visualization",
  "Mindfulness",
];

// Figma "create Meditation" card (node 3138:10666)
const CARD_MAX_WIDTH = 350;
const SCREEN_GUTTER = 16;

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  fontFamily?: string;
};

const Chip = ({ label, selected, onPress, fontFamily = FONTS.interRegular }: ChipProps) => (
  <TouchableOpacity
    activeOpacity={0.85}
    style={[styles.chip, selected && styles.chipSelected]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected }}
  >
    <Text style={[styles.chipText, { fontFamily }, selected && styles.chipTextSelected]} numberOfLines={1}>
      {label}
    </Text>
  </TouchableOpacity>
);

const PersonalisedMeditationModal = ({
  visible,
  initialFocus,
  showPersonaliseUsingConversation = true,
  onClose,
  onBegin,
}: PersonalisedMeditationModalProps) => {
  const insets = useSafeAreaInsets();
  const trimmedInitialFocus = initialFocus?.trim() ?? "";
  const hasInitialFocus = Boolean(trimmedInitialFocus);
  const [focus, setFocus] = React.useState(FOCUS_OPTIONS[0]);
  const trimmedFocus = focus.trim();
  const isCustomFocus = Boolean(trimmedFocus) && !FOCUS_OPTIONS.includes(focus);
  const [isEditingFocus, setIsEditingFocus] = React.useState(false);
  const [selectedLength, setSelectedLength] = React.useState(LENGTH_OPTIONS[0]);
  const [selectedStyle, setSelectedStyle] = React.useState(STYLE_OPTIONS[0]);
  const [personaliseUsingConversation, setPersonaliseUsingConversation] = React.useState(true);

  React.useEffect(() => {
    if (visible) {
      setFocus(trimmedInitialFocus || FOCUS_OPTIONS[0]);
      setIsEditingFocus(false);
      setSelectedLength(LENGTH_OPTIONS[0]);
      setSelectedStyle(STYLE_OPTIONS[0]);
      setPersonaliseUsingConversation(showPersonaliseUsingConversation);
    }
  }, [hasInitialFocus, showPersonaliseUsingConversation, trimmedInitialFocus, visible]);

  // Steps to the next preset focus; from a custom focus it returns to the first preset.
  const handleRefreshFocus = () => {
    const currentIndex = FOCUS_OPTIONS.indexOf(focus);
    setFocus(FOCUS_OPTIONS[(currentIndex + 1) % FOCUS_OPTIONS.length]);
    setIsEditingFocus(false);
  };

  const handleBegin = () => {
    onBegin?.({
      focus,
      length: selectedLength,
      style: selectedStyle,
      personaliseUsingConversation,
    });
    onClose();
  };

  const editFocusButton = (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.iconButton}
      onPress={() => setIsEditingFocus((current) => !current)}
      accessibilityRole="button"
      accessibilityLabel={isEditingFocus ? "Done editing focus" : "Edit focus"}
    >
      {isEditingFocus ? (
        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
      ) : (
        <PencilIcon style={styles.pencilIcon} />
      )}
    </TouchableOpacity>
  );

  const renderFocus = () => {
    if (hasInitialFocus || isEditingFocus) {
      return (
        <View style={styles.focusEditRow}>
          <TextInput
            style={styles.focusInput}
            value={focus}
            onChangeText={setFocus}
            placeholder="Enter your focus"
            placeholderTextColor="rgba(255,255,255,0.7)"
            autoFocus={isEditingFocus}
            returnKeyType="done"
            onSubmitEditing={() => setIsEditingFocus(false)}
          />
          {!hasInitialFocus ? editFocusButton : null}
        </View>
      );
    }

    return (
      <View style={styles.chipsRow}>
        {isCustomFocus ? (
          <Chip
            label={trimmedFocus}
            selected
            fontFamily={FONTS.figtreeMedium}
            onPress={() => setIsEditingFocus(true)}
          />
        ) : (
          FOCUS_OPTIONS.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={focus === option}
              fontFamily={FONTS.figtreeMedium}
              onPress={() => setFocus(option)}
            />
          ))
        )}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleRefreshFocus}
          accessibilityRole="button"
          accessibilityLabel="Suggest another focus"
        >
          <RefreshFocusButton />
        </TouchableOpacity>
        {editFocusButton}
      </View>
    );
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        <View
          style={[
            styles.overlay,
            {
              paddingTop: insets.top + SCREEN_GUTTER,
              paddingBottom: insets.bottom + SCREEN_GUTTER,
              paddingLeft: insets.left + SCREEN_GUTTER,
              paddingRight: insets.right + SCREEN_GUTTER,
            },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          />

          <View style={styles.card}>
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cardContent}
            >
              <Text style={styles.title}>Your Personalised Meditation</Text>

              <Text style={styles.sectionLabel}>Focus</Text>
              {renderFocus()}

              <Text style={styles.sectionLabel}>Length</Text>
              <View style={styles.chipsRow}>
                {LENGTH_OPTIONS.map((length) => (
                  <Chip
                    key={length}
                    label={length}
                    selected={selectedLength === length}
                    onPress={() => setSelectedLength(length)}
                  />
                ))}
              </View>

              <Text style={styles.sectionLabel}>Style</Text>
              <View style={styles.chipsRow}>
                {STYLE_OPTIONS.map((style) => (
                  <Chip
                    key={style}
                    label={style}
                    selected={selectedStyle === style}
                    onPress={() => setSelectedStyle(style)}
                  />
                ))}
              </View>

              {showPersonaliseUsingConversation ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.checkboxRow}
                  onPress={() => setPersonaliseUsingConversation((current) => !current)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: personaliseUsingConversation }}
                >
                  {personaliseUsingConversation ? (
                    <CheckboxCheckedIcon />
                  ) : (
                    <View style={styles.checkboxBox} />
                  )}
                  <Text style={styles.checkboxLabel}>Personalise using this conversation</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.beginButton}
                onPress={handleBegin}
                accessibilityRole="button"
              >
                <View style={styles.beginIconFrame}>
                  <LotusSparkleIcon style={styles.beginIcon} />
                </View>
                <Text style={styles.beginText}>Begin with Lhamo</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default PersonalisedMeditationModal;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: CARD_MAX_WIDTH,
    maxHeight: "100%",
    borderRadius: 15,
    backgroundColor: "#8C8C8A",
    overflow: "hidden",
  },
  cardContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 17,
  },
  title: {
    textAlign: "center",
    fontFamily: FONTS.interBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#FFFFFF",
    marginBottom: 13,
  },
  sectionLabel: {
    fontFamily: FONTS.interBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: 8,
    rowGap: 8,
    marginBottom: 5,
  },
  chip: {
    height: 33,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 50,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    maxWidth: "100%",
  },
  chipSelected: {
    backgroundColor: "#FFFFFF",
  },
  chipText: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
  chipTextSelected: {
    color: "#474747",
  },
  iconButton: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
    backgroundColor: "#A3A3A1",
    alignItems: "center",
    justifyContent: "center",
  },
  // Figma places the 20px pencil 7.5px from the left and 6px from the top of the 33px button
  pencilIcon: {
    position: "absolute",
    left: 7.5,
    top: 6,
  },
  focusEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
  },
  focusInput: {
    flex: 1,
    height: 33,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 0,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    fontFamily: FONTS.figtreeMedium,
    fontSize: 15,
    letterSpacing: -0.24,
    color: "#FFFFFF",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 32,
    paddingLeft: 6,
    marginTop: 2,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  checkboxLabel: {
    flexShrink: 1,
    fontFamily: FONTS.interRegular,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#FFFFFF",
  },
  beginButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    height: 36,
    borderRadius: 50,
    backgroundColor: "rgba(248, 198, 62, 0.78)",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  // Figma clips the 27x28 lotus inside a 22px frame, offset 7.5px upward
  beginIconFrame: {
    width: 22,
    height: 22,
    overflow: "hidden",
  },
  beginIcon: {
    position: "absolute",
    left: 0,
    top: -7.5,
  },
  beginText: {
    fontFamily: FONTS.figtreeBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#FFFFFF",
  },
});
