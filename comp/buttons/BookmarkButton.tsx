import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { images } from "@/constants/images";

type BookmarkButtonProps = {
  onTouch: () => void;
};

const BookmarkButton = ({ onTouch }: BookmarkButtonProps) => {
  return (
    <TouchableOpacity onPress={onTouch} style={styles.touchable}>
      <Image source={images.bookmark} style={styles.icon} resizeMode="contain" />
    </TouchableOpacity>
  );
};

export default BookmarkButton;

const styles = StyleSheet.create({
  touchable: {
    padding: 4,
  },
  icon: {
    width: 20,
    height: 20,
  },
});
