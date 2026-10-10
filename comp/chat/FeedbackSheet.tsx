import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CloseCircle from "@/assets/svg/chat/CloseCircle";
import Star from "@/assets/svg/chat/Star";
import Send from "@/assets/svg/profile/Send";
import { COLORS, FONTS } from "@/theme.js";

// Shared building blocks for the chat "Help us improve" and "Report a problem"
// bottom sheets (Figma nodes 2547:9640 and 2546:10260).

type FeedbackSheetProps = {
  visible: boolean;
  onClose: () => void;
  header: ReactNode;
  children: ReactNode;
};

export const FeedbackSheet = ({ visible, onClose, header, children }: FeedbackSheetProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      transparent
      animationType="slide"
      statusBarTranslucent
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}>
          <View style={styles.header}>
            {header}
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            contentContainerStyle={styles.content}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export const FeedbackSheetCloseButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
    <CloseCircle />
  </Pressable>
);

export const FeedbackSection = ({
  title,
  children,
  topPadding = false,
}: {
  title: string;
  children: ReactNode;
  topPadding?: boolean;
}) => (
  <View style={[styles.section, topPadding && styles.sectionTopPadding]}>
    <Text style={sheetTextStyles.heading}>{title}</Text>
    {children}
  </View>
);

export const FeedbackStars = ({
  value,
  onChange,
  gap = 10,
}: {
  value: number;
  onChange: (rating: number) => void;
  gap?: number;
}) => (
  <View style={[styles.starsRow, { gap }]}>
    {Array.from({ length: 5 }, (_, index) => {
      const rating = index + 1;

      return (
        <Pressable
          key={rating}
          onPress={() => onChange(rating)}
          hitSlop={{ top: 8, bottom: 8, left: gap / 2, right: gap / 2 }}
          accessibilityRole="button"
          accessibilityLabel={`${rating} star${rating > 1 ? "s" : ""}`}
        >
          <Star filled={index < value} />
        </Pressable>
      );
    })}
  </View>
);

export const FeedbackChips = ({
  options,
  selected,
  onToggle,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (option: string) => void;
}) => (
  <View style={styles.chipsContainer}>
    {options.map((option) => {
      const isSelected = selected.includes(option);

      return (
        <Pressable
          key={option}
          onPress={() => onToggle(option)}
          style={[styles.chip, isSelected && styles.chipSelected]}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
        >
          <Text style={styles.chipText}>{option}</Text>
        </Pressable>
      );
    })}
  </View>
);

export const FeedbackTextArea = ({
  value,
  onChangeText,
  placeholder,
  counter,
  maxLength,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  counter: string;
  maxLength?: number;
}) => (
  <View style={styles.textAreaWrapper}>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#E6E6E6"
      multiline
      maxLength={maxLength}
      textAlignVertical="top"
      style={styles.textArea}
    />
    <Text style={styles.counterText}>{counter}</Text>
  </View>
);

export const FeedbackSubmitButton = ({
  onPress,
  isLoading = false,
}: {
  onPress: () => void;
  isLoading?: boolean;
}) => (
  <View style={styles.submitRow}>
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      style={({ pressed }) => [
        styles.submitButton,
        (pressed || isLoading) && styles.submitButtonDimmed,
      ]}
      accessibilityRole="button"
    >
      {isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Send />}
      <Text style={styles.submitText}>Submit</Text>
    </Pressable>
  </View>
);

export const sheetTextStyles = StyleSheet.create({
  heading: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#FFFFFF",
  },
  body: {
    fontFamily: FONTS.interRegular,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#FFFFFF",
  },
});

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    width: "100%",
    maxHeight: "90%",
    paddingTop: 20,
    backgroundColor: "rgba(40, 40, 40, 0.8)",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 33,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FAFAFA",
  },
  content: {
    paddingTop: 10,
    gap: 10,
  },
  section: {
    paddingHorizontal: 33,
    gap: 10,
  },
  sectionTopPadding: {
    paddingTop: 5,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  chipSelected: {
    backgroundColor: COLORS.brandYellow,
  },
  chipText: {
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
  textAreaWrapper: {
    height: 60,
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 3,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  textArea: {
    flex: 1,
    padding: 0,
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.24,
    color: "#FFFFFF",
  },
  counterText: {
    alignSelf: "flex-end",
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: -0.24,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
  submitRow: {
    alignItems: "center",
    paddingTop: 5,
  },
  submitButton: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingLeft: 10,
    paddingRight: 15,
    borderRadius: 50,
    backgroundColor: COLORS.brandYellow,
  },
  submitButtonDimmed: {
    opacity: 0.75,
  },
  submitText: {
    fontFamily: FONTS.figtreeMedium500,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
});
