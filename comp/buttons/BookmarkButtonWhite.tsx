import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { images } from "@/constants/images";

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
    <TouchableOpacity
      onPress={onTouch}
      disabled={disabled}
      style={[styles.touchable, disabled ? styles.disabled : null]}
    >
      <Image
        source={isBookmarked ? images.bookmarked : images.bookmark_white}
        style={[styles.icon, isBookmarked ? styles.bookmarkedIcon : null]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

export default BookmarkButtonWhite;

const styles = StyleSheet.create({
  touchable: {
    padding: 4,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 20,
    height: 20,
  },
  bookmarkedIcon: {
    width: 30,
    height: 30,
  },
  disabled: {
    opacity: 0.6,
  },
});
