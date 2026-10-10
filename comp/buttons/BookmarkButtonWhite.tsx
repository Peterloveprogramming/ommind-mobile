import React from "react";
import { Pressable, StyleSheet } from "react-native";
import BookmarkIcon from "@/assets/svg/meditation_session/BookmarkIcon";

type BookmarkButtonWhiteProps = {
  onTouch: () => void;
  isBookmarked?: boolean;
  disabled?: boolean;
};

const BookmarkButtonWhite = ({
  onTouch,
  isBookmarked = false,
  disabled = false,
}: BookmarkButtonWhiteProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isBookmarked ? "Remove from saved" : "Save session"}
      accessibilityState={{ selected: isBookmarked, disabled }}
      onPress={onTouch}
      disabled={disabled}
      hitSlop={10}
      style={({ pressed }) => [
        styles.touchable,
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <BookmarkIcon filled={isBookmarked} />
    </Pressable>
  );
};

export default BookmarkButtonWhite;

const styles = StyleSheet.create({
  touchable: {
    width: 24,
    height: 24,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.6,
  },
});
