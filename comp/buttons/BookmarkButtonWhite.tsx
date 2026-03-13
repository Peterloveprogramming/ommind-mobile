import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { images } from "@/constants/images";

type BookmarkButtonWhiteProps = {
  onTouch: () => void;
};

const BookmarkButtonWhite = ({ onTouch }: BookmarkButtonWhiteProps) => {
  return (
    <TouchableOpacity onPress={onTouch} style={styles.touchable}>
      <Image source={images.bookmark_white} style={styles.icon} resizeMode="contain" />
    </TouchableOpacity>
  );
};

export default BookmarkButtonWhite;

const styles = StyleSheet.create({
  touchable: {
    padding: 4,
  },
  icon: {
    width: 20,
    height: 20,
  },
});
