import MeditationCard from "@/comp/explore/MeditationCard";
import { FONTS } from "@/theme";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const Explore = () => {
  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Coming Soon</Text> */}
      <View>
        <View
          style={styles.rowContainer}
        >
          <Text style={styles.title}>Calm</Text>
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsRow}
            >
              <MeditationCard
                numberOfSessions={5}
                description="Calm Abiding 1: Foundation of Inner Stillness"
                onPress={() => {}}
              />

              <MeditationCard
                numberOfSessions={5}
                description="Calm Abiding 1: Foundation of Inner Stillness"
                onPress={() => {}}
              />

              <MeditationCard
                numberOfSessions={5}
                description="Calm Abiding 1: Foundation of Inner Stillness"
                onPress={() => {}}
              />

            </ScrollView>
          </View>
        </View>


        <View
          style={styles.rowContainer}
        >
          <Text style={styles.title}>Calm</Text>
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsRow}
            >
              <MeditationCard
                numberOfSessions={5}
                description="Calm Abiding 1: Foundation of Inner Stillness"
                onPress={() => {}}
              />

              <MeditationCard
                numberOfSessions={5}
                description="Calm Abiding 1: Foundation of Inner Stillness"
                onPress={() => {}}
              />

              <MeditationCard
                numberOfSessions={5}
                description="Calm Abiding 1: Foundation of Inner Stillness"
                onPress={() => {}}
              />

            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Explore

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:50,
    paddingLeft:25
  },
  rowContainer:{
    gap:10,
    marginBottom:15,
  },
  title:{
    fontFamily:FONTS.figtreeSemiBold,
    fontSize:20
  },
  cardsRow: {
    gap: 12,
    paddingRight: 15,
  }
});
