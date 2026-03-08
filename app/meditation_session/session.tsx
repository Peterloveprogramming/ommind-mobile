import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MeditationSession from "@/comp/meditation_session/MeditationSession";

const Session = () => {
  return (
    <MeditationSession />
  );
};

export default Session

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

});
