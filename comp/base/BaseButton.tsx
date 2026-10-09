import { StyleSheet, Text, View, TouchableOpacity,ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import React from 'react';
import { FONTS } from "@/theme.js";
import { COLORS } from '@/theme.js';

// debug
let debug = false;

interface BaseButtonProps {
  backgroundColor?: string;
  fontColor?: string;
  text: string;
  height?: number;
  fontSize?: number;
  onPress: () => void;
  useIcon?: boolean;
  icon?: React.ReactNode;
  style?:ViewStyle;
  textStyle?:TextStyle;
  isLoading?:boolean;
  disabled?: boolean;
  disabledBackgroundColor?: string;
}

const BaseButton = ({
  backgroundColor = COLORS.brandYellow,
  fontColor = "white",
  text,
  height = 48,
  fontSize = 17,
  onPress,
  useIcon = false,
  icon,
  style,
  textStyle,
  isLoading = false,     // <-- add default
  disabled = false,
  disabledBackgroundColor = "#D9D9D9",
}: BaseButtonProps) => {
  const isInactive = disabled || isLoading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isInactive}
      activeOpacity={isInactive ? 1 : 0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: isLoading }}
    >
      <View
        style={[
          styles.buttonContainer,
          { backgroundColor: disabled && !isLoading ? disabledBackgroundColor : backgroundColor, height },
          style
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={fontColor} />
        ) : (
          <>
            {useIcon && icon && <View style={{ marginRight: 8 }}>{icon}</View>}
            <Text style={[styles.buttonText, { color: fontColor, fontSize }, textStyle]}>{text}</Text>
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
