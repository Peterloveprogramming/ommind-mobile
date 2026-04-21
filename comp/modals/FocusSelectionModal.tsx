import React from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FONTS } from "@/theme";

type FocusSelectionModalProps = {
  visible: boolean;
  onClose: () => void;
  initialSelectedFocusItems?: string[];
  onConfirm?: (selectedFocusItems: string[]) => void | Promise<void>;
  isSubmitting?: boolean;
};

const CHANGE_FOCUS_ICON = require("@/assets/images/profile/change_focus_icon.png");
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

const FocusSelectionModal = ({
  visible,
  onClose,
  initialSelectedFocusItems = [],
  onConfirm,
  isSubmitting = false,
}: FocusSelectionModalProps) => {
  const [selectedFocusItems, setSelectedFocusItems] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (visible) {
      setSelectedFocusItems(initialSelectedFocusItems);
    }
  }, [initialSelectedFocusItems, visible]);

  const handleToggleFocus = (focus: string) => {
    setSelectedFocusItems((currentItems) => {
      if (currentItems.includes(focus)) {
        return currentItems.filter((item) => item !== focus);
      }

      if (currentItems.length >= MAX_SELECTED_FOCUS_ITEMS) {
        return currentItems;
      }

      return [...currentItems, focus];
    });
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.iconWrap}>
            <Image source={CHANGE_FOCUS_ICON} style={styles.icon} />
          </View>

          <Text style={styles.title}>Your focus</Text>
          <Text style={styles.subtitle}>Select up to 5 areas of focus</Text>

          <ScrollView
            style={styles.optionsScroll}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            {FOCUS_OPTIONS.map((focus) => {
              const isSelected = selectedFocusItems.includes(focus);

              return (
                <TouchableOpacity
                  key={focus}
                  activeOpacity={0.85}
                  style={styles.optionRow}
                  onPress={() => handleToggleFocus(focus)}
                >
                  <Text style={styles.optionLabel}>{focus}</Text>
                  <View style={[styles.optionIndicator, isSelected && styles.optionIndicatorSelected]}>
                    {isSelected ? <Text style={styles.optionCheckmark}>✓</Text> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
            onPress={() => onConfirm?.(selectedFocusItems)}
            disabled={isSubmitting}
          >
            <Text style={styles.confirmButtonText}>Confirm focus</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default FocusSelectionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17, 17, 17, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  card: {
    maxHeight: "92%",
    borderRadius: 28,
    backgroundColor: "#FFFDF9",
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  iconWrap: {
    alignSelf: "center",
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F1ECE4",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 34,
    height: 34,
    resizeMode: "contain",
  },
  title: {
    marginTop: 12,
    textAlign: "center",
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 24,
    lineHeight: 30,
    color: "#111111",
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    fontFamily: FONTS.inter,
    fontSize: 13,
    lineHeight: 18,
    color: "#8F8A85",
  },
  optionsScroll: {
    marginTop: 18,
  },
  optionsContent: {
    paddingBottom: 8,
  },
  optionRow: {
    minHeight: 58,
    borderRadius: 10,
    backgroundColor: "#E8E8EC",
    paddingHorizontal: 28,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionLabel: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 17,
    lineHeight: 22,
    color: "#646464",
  },
  optionIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#C5C5C9",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  optionIndicatorSelected: {
    borderColor: "#F7C648",
    backgroundColor: "#F7C648",
  },
  optionCheckmark: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 18,
    lineHeight: 20,
    color: "#FFFFFF",
  },
  confirmButton: {
    marginTop: 8,
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: "#595959",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 16,
    lineHeight: 20,
    color: "#FFFFFF",
  },
});
