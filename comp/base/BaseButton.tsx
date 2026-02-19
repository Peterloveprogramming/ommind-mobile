import { StyleSheet, Text, View, TouchableOpacity,ViewStyle, ActivityIndicator } from 'react-native';
import React from 'react';
import { FONTS } from "@/theme.js";
import { COLORS } from '@/theme.js';

// debug
let debug = false;

interface BaseButtonProps {
  backgroundColor?: string;
  fontColor?: string;
  text: string;
  height: number;
  onPress: () => void;
  useIcon: boolean;
  icon?: React.ReactNode;
  style?:ViewStyle;
  isLoading:boolean
}

const BaseButton = ({
  backgroundColor = COLORS.brandYellow,
  fontColor = "white",
  text,
  height = 48,
  onPress,
  useIcon = false,
  icon,
  style,
  isLoading = false,     // <-- add default
}: BaseButtonProps) => {
  return (
    <TouchableOpacity onPress={isLoading ? undefined : onPress} activeOpacity={isLoading ? 1 : 0.7}>
      <View
        style={[
          styles.buttonContainer,
          { backgroundColor, height },
          style
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={fontColor} />
        ) : (
          <>
            {useIcon && icon && <View style={{ marginRight: 8 }}>{icon}</View>}
            <Text style={[styles.buttonText, { color: fontColor }]}>{text}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};


export default BaseButton;

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 25,           // Always set the borderRadius here
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
    overflow: "hidden",         // Ensure content respects the border radius
    borderWidth:debug?1:0
  },
  buttonText: {
    textAlign: "center",
    fontSize: 17,
    fontFamily: FONTS.figtreeSemiBold,
  },
});
