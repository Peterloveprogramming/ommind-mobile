import MeditationCard from "@/comp/explore/MeditationCard";
import { FONTS } from "@/theme";
import React from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { MeditationCourse, MeditationCoursesByType } from "@/api/lambda/meditation/types";
import { useMeditationCourses } from "@/services/meditation/useMeditationCourses";
import WebsocketConnectionTest from "@/dummy/tests/WebsocketConnectionTest";

const COURSE_TYPES: Array<keyof MeditationCoursesByType> = ["calm", "awareness", "insight"];

const formatSectionTitle = (value: keyof MeditationCoursesByType) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const Explore = () => {
  const router = useRouter();
  const { result, error, fetchMeditationCourses } = useMeditationCourses();
  const coursesByType = result?.data?.courses;

  useFocusEffect(
    React.useCallback(() => {
      void fetchMeditationCourses();
    }, [fetchMeditationCourses])
  );

  const handleCoursePress = (item: MeditationCourse) => {
    router.push({
      pathname: "/meditation_session/session",
      params: {
        uuid: item.uuid,
        type: item.type,
        course_number: String(item.course_number),
      },
    });
  };

  const renderCourseRow = (type: keyof MeditationCoursesByType) => {
    const courses = coursesByType?.[type] ?? [];

    return (
      <View style={styles.rowContainer} key={type}>
        <Text style={styles.title}>{formatSectionTitle(type)}</Text>
        <FlatList
          horizontal
          data={courses}
          keyExtractor={(item) => item.uuid}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsRow}
          renderItem={({ item }) => (
            <MeditationCard
              uuid={item.uuid}
              numberOfSessions={item.number_of_sessions}
              description={`${item.proper_type_name} ${item.course_number}: ${item.title}`}
              image_source={item.image_url}
              type={item.type}
              onPress={() => void handleCoursePress(item)}
            />
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Coming Soon</Text>}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Coming Soon</Text> */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.verticalContent}
      >
        {COURSE_TYPES.map((type) => renderCourseRow(type))}
        {error ? <Text style={styles.errorText}>Failed to load meditation courses.</Text> : null}
      </ScrollView>
    </View>
  );
};

// const Explore = () => {
    // testing websocket connection 
//   return <WebsocketConnectionTest />;
// }
export default Explore

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingLeft: 25
  },
  verticalContent: {
    paddingBottom: 24,
  },
  rowContainer: {
    gap: 10,
    marginBottom: 15,
  },
  title: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 20
  },
  cardsRow: {
    gap: 12,
    paddingRight: 15,
  },
  emptyText: {
    fontFamily: FONTS.figtreeMedium,
    color: "#8B8B8B",
  },
  errorText: {
    fontFamily: FONTS.figtreeMedium,
    color: "#B3261E",
    paddingRight: 20,
  },

});
