import React from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS } from "@/theme";
import { images } from "@/constants/images";

export type PersonalisedMeditationSelection = {
  focus: string;
  length: string;
  style: string;
  personaliseUsingConversation: boolean;
};

type PersonalisedMeditationModalProps = {
  visible: boolean;
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

const PersonalisedMeditationModal = ({
  visible,
  onClose,
  onBegin,
}: PersonalisedMeditationModalProps) => {
  const [focus, setFocus] = React.useState(FOCUS_OPTIONS[0]);
  const [isEditingFocus, setIsEditingFocus] = React.useState(false);
  const [selectedLength, setSelectedLength] = React.useState(LENGTH_OPTIONS[0]);
  const [selectedStyle, setSelectedStyle] = React.useState(STYLE_OPTIONS[0]);
  const [personaliseUsingConversation, setPersonaliseUsingConversation] = React.useState(true);

  React.useEffect(() => {
    if (visible) {
      setFocus(FOCUS_OPTIONS[0]);
      setIsEditingFocus(false);
      setSelectedLength(LENGTH_OPTIONS[0]);
      setSelectedStyle(STYLE_OPTIONS[0]);
      setPersonaliseUsingConversation(true);
    }
  }, [visible]);

  const handleBegin = () => {
    onBegin?.({
      focus,
      length: selectedLength,
      style: selectedStyle,
      personaliseUsingConversation,
    });
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Your Personalised Meditation</Text>

          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionLabel, styles.sectionLabelNoMargin]}>Focus</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.iconButton}
              onPress={() => setIsEditingFocus((current) => !current)}
            >
              {isEditingFocus ? (
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              ) : (
                <Image source={images.pencil_icon} style={styles.pencilIcon} />
              )}
            </TouchableOpacity>
          </View>

          {isEditingFocus ? (
            <TextInput
              style={styles.focusInput}
              value={focus}
              onChangeText={setFocus}
              placeholder="Enter your focus"
              placeholderTextColor="rgba(255,255,255,0.7)"
              autoFocus
              onSubmitEditing={() => setIsEditingFocus(false)}
            />
          ) : (
            <View style={styles.chipsRow}>
              {FOCUS_OPTIONS.map((option) => {
                const isSelected = focus === option;
                return (
                  <TouchableOpacity
                    key={option}
                    activeOpacity={0.85}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setFocus(option)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <Text style={styles.sectionLabel}>Length</Text>
          <View style={styles.chipsRow}>
            {LENGTH_OPTIONS.map((length) => {
              const isSelected = selectedLength === length;
              return (
                <TouchableOpacity
                  key={length}
                  activeOpacity={0.85}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setSelectedLength(length)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {length}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Style</Text>
          <View style={styles.chipsRow}>
            {STYLE_OPTIONS.map((style) => {
              const isSelected = selectedStyle === style;
              return (
                <TouchableOpacity
                  key={style}
                  activeOpacity={0.85}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setSelectedStyle(style)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {style}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.checkboxRow}
            onPress={() => setPersonaliseUsingConversation((current) => !current)}
          >
            <View style={[styles.checkboxBox, personaliseUsingConversation && styles.checkboxBoxChecked]}>
              {personaliseUsingConversation ? (
                <Ionicons name="checkmark" size={16} color="#8C8C8A" />
              ) : null}
            </View>
            <Text style={styles.checkboxLabel}>Personalise using this conversation</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} style={styles.beginButton} onPress={handleBegin}>
            <Image source={images.magic_stick} style={styles.beginIcon} />
            <Text style={styles.beginText}>Begin with Lhamo</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PersonalisedMeditationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  card: {
    borderRadius: 24,
    backgroundColor: "#8C8C8A",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  title: {
    textAlign: "center",
    fontFamily: FONTS.figtreeBold,
    fontSize: 18,
    lineHeight: 24,
    color: "#FFFFFF",
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: "#FFFFFF",
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap:15,
    // justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionLabelNoMargin: {
    marginBottom: 0,
  },
  focusInput: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 20,
    fontFamily: FONTS.inter,
    fontSize: 14,
    color: "#FFFFFF",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  pencilIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  chipSelected: {
    backgroundColor: "#FFFFFF",
  },
  chipText: {
    fontFamily: FONTS.inter,
    fontSize: 14,
    color: "#FFFFFF",
  },
  chipTextSelected: {
    fontFamily: FONTS.interSemiBold,
    color: "#3A3A38",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 22,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkboxBoxChecked: {
    backgroundColor: "#FFFFFF",
  },
  checkboxLabel: {
    flexShrink: 1,
    fontFamily: FONTS.inter,
    fontSize: 14,
    color: "#FFFFFF",
  },
  beginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 50,
    borderRadius: 999,
    backgroundColor: "#D89B4A",
    paddingHorizontal: 24,
  },
  beginIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  beginText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 16,
    color: "#FFFFFF",
  },
});
