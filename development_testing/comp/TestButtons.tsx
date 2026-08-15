import { FONTS } from "@/theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import TestButtonsPopup from "./TestButtonsPopup";

const TestButtons = () => {
  const [isPopupVisible, setIsPopupVisible] = React.useState(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        accessibilityRole="button"
        onPress={() => setIsPopupVisible(true)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Test Buttons</Text>
      </TouchableOpacity>

      <TestButtonsPopup visible={isPopupVisible} onClose={() => setIsPopupVisible(false)} />
    </>
  );
};

export default TestButtons;

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
    minWidth: 154,
    minHeight: 44,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: "#595959",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 16,
    lineHeight: 20,
    color: "#FFFFFF",
  },
});
