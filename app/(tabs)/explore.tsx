import MeditationCard from "@/comp/explore/MeditationCard";
import { FONTS } from "@/theme";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router"; // Import useRouter for navigation

const Explore = () => {

  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Coming Soon</Text> */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.verticalContent}
      >
        {/* Calm */}
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
                onPress={() => router.push("/meditation_session/session")}
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

        {/* Insight */}
        <View
          style={styles.rowContainer}
        >
          <Text style={styles.title}>Insight</Text>
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


         {/* Awareness */}
        <View
          style={styles.rowContainer}
        >
          <Text style={styles.title}>Awareness</Text>
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


         {/* Loving Kindness */}
        <View
          style={styles.rowContainer}
        >
          <Text style={styles.title}>Loving Kindness</Text>
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


        {/* Mindfulness */}
        <View
          style={styles.rowContainer}
        >
          <Text style={styles.title}>Mindfulness</Text>
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



        {/* Energy */}
        <View
          style={styles.rowContainer}
        >
          <Text style={styles.title}>Energy</Text>
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


        {/* Energy */}
        <View
          style={styles.rowContainer}
        >
          <Text style={styles.title}>Energy</Text>
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

        {/* Transcendence */}
        <View
          style={styles.rowContainer}
        >
          <Text style={styles.title}>Transcendence</Text>
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
        
      </ScrollView>
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
    verticalContent: {
    paddingBottom: 24,
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
  },

});
