import React, { useEffect } from "react";
import { StyleSheet, ImageBackground, View, ScrollView ,Text, TouchableOpacity, Image} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type {
  MeditationCourse,
  MeditationCourseDescriptionSection,
  MeditationCourseSession,
} from "@/api/lambda/meditation/types";
import { images } from "@/constants/images";
import { FONTS } from "@/theme";
import BookmarkButton from "@/comp/buttons/BookmarkButton";
import BaseButton from "../base/BaseButton";
import { colors } from "@/constants/colors";
import { useMeditationCourses } from "@/services/meditation/useMeditationCourses";

type SessionCardProps = {
  title: string;
  completed: boolean;
  locked: boolean;
  courseId?: MeditationCourseSession["course_id"];
  favourite: MeditationCourseSession["favourite"];
  messageId?: MeditationCourseSession["message_id"];
  courseNumber: number;
  sessionNumber: number;
  sessionLengthInMins: number;
  meditationType: string;
  imageUrl: string;
  backgroundUrl: string;
  sessionTitles: string;
  sessionMetadata: string;
  progress?: number | null;
};

type TagProps = {
  tag: string;
};

const SessionCard = ({
  title,
  completed,
  locked,
  courseId,
  favourite,
  messageId,
  courseNumber,
  sessionNumber,
  sessionLengthInMins,
  meditationType,
  imageUrl,
  backgroundUrl,
  sessionTitles,
  sessionMetadata,
  progress,
}: SessionCardProps) => {
  const router = useRouter();
  const showLock = locked;
  const statusIcon = locked ? images.unchecked : completed ? images.checked : images.unchecked;

  const cardContent = (
    <View
      style={{ width: "100%", minHeight: 64, borderRadius: 10, backgroundColor: "#E8E6E6", padding: 10 }}
    >
      <View>
        <Text style={{ fontSize: 14, fontFamily: FONTS.figtreeSemiBold }}>{title}</Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 8, alignItems: "center" }}>
          <Image source={statusIcon} style={{ width: 14, height: 14 }} resizeMode="contain" />
          <Text style={{ fontFamily: FONTS.figtreeMedium, color: "#8E8E93" }}>{sessionLengthInMins} Min</Text>
        </View>
        {showLock ? (
          <View>
            <Image source={images.lock} style={{ width: 14, height: 14 }} resizeMode="contain" />
          </View>
        ) : null}
      </View>
    </View>
  );

  if (locked) {
    return cardContent;
  }

  const handlePress = () => {
    router.push({
      pathname: "/meditation_session/player",
      params: {
        title,
        course_id: courseId == null ? "" : String(courseId),
        favourite: String(favourite),
        message_id: messageId == null ? "" : String(messageId),
        course_number: String(courseNumber),
        session_number: String(sessionNumber),
        type: meditationType,
        image_url: imageUrl,
        backgroundUrl:backgroundUrl,
        session_titles: sessionTitles,
        session_metadata: sessionMetadata,
        progress: progress == null ? "" : String(progress),
      },
    });
  };

  return <TouchableOpacity
    onPress={handlePress}
  >{cardContent}</TouchableOpacity>;
};

const Tag = ({ tag }: TagProps) => {
  return (
    <View style={styles.tagContainer}>
      <Text style={styles.tagText}>{tag}</Text>
    </View>
  );
};

const renderDescriptionSection = (section: MeditationCourseDescriptionSection) => {
  return (
    <>
      {section.intro ? <Text style={styles.sessionDescriptionText}>{section.intro}</Text> : null}
      {section.bullets?.map((bullet) => (
        <Text key={bullet} style={styles.sessionDescriptionText}>
          {"\u2022"} {bullet}
        </Text>
      ))}
      {section.outro ? <Text style={styles.sessionDescriptionText}>{section.outro}</Text> : null}
    </>
  );
};

const MeditationSession = () => {
  const params = useLocalSearchParams<{ uuid?: string; type?: string }>();
  const { detailsResult, detailsStatus, fetchMeditationCourseDetails } = useMeditationCourses();
  const courseDetails = detailsResult?.data?.course_details;

  useEffect(() => {
    if (!params.uuid || !params.type) {
      return;
    }

    void fetchMeditationCourseDetails({
      uuid: params.uuid,
      type: params.type as MeditationCourse["type"],
    });
  }, [fetchMeditationCourseDetails, params.type, params.uuid]);

  useEffect(() => {
    if (detailsResult?.data?.course_details) {
      console.log("Meditation course details:", detailsResult.data.course_details);
    }
  }, [detailsResult]);

  if (!courseDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>Meditation Course Is Loading</Text>
        <Text style={styles.loadingDescription}>
          Please wait while we prepare the course details for you.
        </Text>
      </View>
    );
  }

  const sessionTitles = JSON.stringify(
    courseDetails.sessions.reduce<Record<string, string>>((titlesBySession, session) => {
      titlesBySession[String(session.session_number)] = `Session ${session.session_number}: ${session.session_title}`;
      return titlesBySession;
    }, {}),
  );
  const sessionMetadata = JSON.stringify(
    courseDetails.sessions.reduce<
      Record<string, Pick<MeditationCourseSession, "course_id" | "favourite" | "message_id">>
    >((metadataBySession, session) => {
      metadataBySession[String(session.session_number)] = {
        course_id: session.course_id ?? null,
        favourite: session.favourite,
        message_id: session.message_id ?? null,
      };
      return metadataBySession;
    }, {}),
  );
  console.log("data is",detailsResult.data)

  return (
    <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
          >
            <ImageBackground
              source={
                courseDetails?.image_url
                  ? { uri: courseDetails.image_url }
                  : images.meditation_test
              }
              style={styles.image}
            />
            <View style={{padding:20,gap:5}}>
              <Text style={{fontFamily:FONTS.figtreeMedium,fontSize:16,color:"#8B8B8B"}}>
                {courseDetails
                  ? `${courseDetails.number_of_sessions} Sessions • Guided Meditation`
                  : detailsStatus === "loading"
                    ? "Loading course details..."
                    : "Guided Meditation"}
              </Text>
              
              <View style={styles.titleRow}>
                <Text style={styles.titleText}>
                  {courseDetails
                    ? `${courseDetails.proper_type_name} ${courseDetails.course_number}: ${courseDetails.title}`
                    : "Meditation Course"}
                </Text>
                {/* <BookmarkButton onTouch={() => console.log("Bookmark pressed")} /> */}
              </View>
              <Text style={{fontFamily:FONTS.figtreeMedium,color:"#8B8B8B",fontSize:16}}>By OmMind</Text>

              <BaseButton
                onPress={() => console.log("helloman")}
                text="Play"
                style={{marginVertical:10}}
                height={48}
                useIcon={false}
                isLoading={false}
              />

              {courseDetails?.sessions.map((session, index) => (
                <SessionCard
                  key={session.session_number}
                  title={`Session ${session.session_number}: ${session.session_title}`}
                  completed={false}
                  locked={false}
                  courseId={session.course_id}
                  favourite={session.favourite}
                  messageId={session.message_id}
                  courseNumber={courseDetails.course_number}
                  sessionNumber={session.session_number}
                  sessionLengthInMins={session.session_length}
                  meditationType={courseDetails.type}
                  imageUrl={courseDetails.image_url}
                  backgroundUrl={courseDetails.background_url}
                  sessionTitles={sessionTitles}
                  sessionMetadata={sessionMetadata}
                  progress={session.progress}
                />
              ))}

              <View
                style={{marginVertical:10}}
              >
                <Text
                  style={styles.sessionTitleText}
                >About This Series</Text>

                {courseDetails?.description.about_this_series.map((paragraph) => (
                  <Text key={paragraph} style={styles.sessionDescriptionText}>
                    {paragraph}
                  </Text>
                ))}
              </View>

              <View
                style={{flexDirection:"row",gap:5,flexWrap:"wrap",rowGap:8}}
              >
                {courseDetails?.tags.map((tag) => (
                  <Tag key={tag} tag={tag} />
                ))}
              </View>

              <View style={{marginVertical:10}}>
                <Text style={styles.sessionTitleText}>
                  Important: Who This Is For
                </Text>
                {courseDetails
                  ? renderDescriptionSection(courseDetails.description.who_this_is_for)
                  : null}
              </View>

              <View style={{marginVertical:10}}>
                <Text style={styles.sessionTitleText}>
                  Source & Integrity
                </Text>
                {courseDetails?.description.source_and_integrity.map((paragraph) => (
                  <Text key={paragraph} style={styles.sessionDescriptionText}>
                    {paragraph}
                  </Text>
                ))}
              </View>

              <View style={{marginTop:10,marginBottom:40}}>
                <Text style={styles.sessionTitleText}>
                  What You Can Expect
                </Text>
                {courseDetails
                  ? renderDescriptionSection(courseDetails.description.what_you_can_expect)
                  : null}
              </View>
            </View>
          </ScrollView>
    </View>
  );
};

export default MeditationSession

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: "#FFFFFF",
  },
  loadingTitle: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 24,
    color: "#0F0909",
    marginBottom: 10,
    textAlign: "center",
  },
  loadingDescription: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 16,
    color: "#8B8B8B",
    textAlign: "center",
    lineHeight: 24,
  },
  image: {
    width: "100%",
    height: 281,
  },
  titleRow: {
    // borderWidth: 1,
    width: "100%",
    minHeight: 100,
    gap: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  titleText: {
    flex: 1,
    flexShrink: 1,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 24,
  },sessionTitleText:{
    fontFamily:FONTS.figtreeSemiBold,
    fontSize:20,
    marginBottom:15
  },
  sessionDescriptionText:{
    fontFamily: FONTS.figtreeMedium,
    fontSize: 16,
    color:"#8B8B8B"
  },
  tagText:{
    color:"#FFA800",
    fontWeight:"500",
    fontSize:16,
  },
  tagContainer:{
    minHeight:36,
    backgroundColor:"#ecdaa9",
    justifyContent:"center",
    alignItems:"center",
    alignSelf:"flex-start",
    paddingHorizontal:14,
    borderRadius:25,
    borderWidth:1,
    borderColor:colors.brand3,
  }
});
