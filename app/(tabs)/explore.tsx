import MicTest from "@/dummy/tests/MicTest";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Explore = () => {
  return (
    <MicTest />
    // <View style={styles.container}>
    //   <Text style={styles.title}>Coming Soon</Text>
    // </View>
  );
};

export default Explore

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F2EA",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
});
