import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView ,Text, TouchableOpacity, Image} from "react-native";
import { useRouter } from "expo-router";
import { images } from "@/constants/images";
import { FONTS } from "@/theme";
import BookmarkButton from "@/comp/headers/BookmarkButton";
import BaseButton from "../base/BaseButton";
import { colors } from "@/constants/colors";

type SessionCardProps = {
  title: string;
  completed: boolean;
  locked: boolean;
  courseNumber: number;
  sessionNumber: number;
  meditationType: string;
};

type TagProps = {
  tag: string;
};

const SessionCard = ({
  title,
  completed,
  locked,
  courseNumber,
  sessionNumber,
  meditationType,
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
          <Text style={{ fontFamily: FONTS.figtreeMedium, color: "#8E8E93" }}>20 Min</Text>
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

  return <TouchableOpacity
    onPress={() =>
      router.push({
        pathname: "/meditation_session/player",
        params: {
          title,
          course_number: String(courseNumber),
          session_number: String(sessionNumber),
          type: meditationType,
        },
      })
    }
  >{cardContent}</TouchableOpacity>;
};

const Tag = ({ tag }: TagProps) => {
  return (
    <View style={styles.tagContainer}>
      <Text style={styles.tagText}>{tag}</Text>
    </View>
  );
};

const MeditationSession = () => {
  return (
    <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
          >
            <ImageBackground source={images.calm_abiding} style={styles.image} />
            <View style={{padding:20,gap:5}}>
              {/* 5 is prop - numberOfSessions */}
              <Text style={{fontFamily:FONTS.figtreeMedium,fontSize:16,color:"#8B8B8B"}}>5 Sessions • Guided Meditation</Text>
              
              <View style={styles.titleRow}>
                <Text style={styles.titleText}>
                  Calm Abiding 1: Foundation of Inner Stillness
                </Text>
                <BookmarkButton onTouch={() => console.log("Bookmark pressed")} />
              </View>
              <Text style={{fontFamily:FONTS.figtreeMedium,color:"#8B8B8B",fontSize:16}}>By Ommind</Text>

              <BaseButton
                onPress={() => console.log("helloman")}
                text="Play"
                style={{marginVertical:10}}
                height={48}
                useIcon={false}
                isLoading={false}
              />


              {/* flastlist */}
              <SessionCard
                title="Session 1: Grounding the Body and Posture"
                completed={false}
                locked={false}
                courseNumber={1}
                sessionNumber={1}
                meditationType="calm"
              />
              <SessionCard
                title="Session 2: Natural Breath Awareness"
                completed={false}
                locked={true}
                courseNumber={1}
                sessionNumber={2}
                meditationType="calm_abiding"
              />

              <SessionCard
                title="Session 3: Counting the Breath from 1 to 10"
                completed={false}
                locked={true}
                courseNumber={1}
                sessionNumber={3}
                meditationType="calm_abiding"
              />

              <SessionCard
                title="Session 4: Effort and Relaxed Awareness"
                completed={false}
                locked={true}
                courseNumber={1}
                sessionNumber={4}
                meditationType="calm_abiding"
              />

              <SessionCard
                title="Session 5: Mindfulness in Daily Life"
                completed={false}
                locked={true}
                courseNumber={1}
                sessionNumber={5}
                meditationType="calm_abiding"
              />

              <View
                style={{marginVertical:10}}
              >
                <Text
                  style={styles.sessionTitleText}
                >About This Series</Text>

                <Text style={styles.sessionDescriptionText}>
                  This course is not just about learning to meditate — it is about remembering your natural state of calm awareness. Rooted in the ancient practice of Śamatha (Calm Abiding), this first stage offers a foundational path to inner stability, clarity, and peace.
                </Text>
                <Text style={styles.sessionDescriptionText}>
                  Over five carefully guided sessions, you will be gently led into deeper states of presence — through the body, the breath, and the stillness that lies beneath all thought. This course is designed for those who are new to meditation, or who feel called to reconnect with the essence of the practice from a deeper place.
                </Text>
                <Text style={styles.sessionDescriptionText}>
                  There are no expectations, no need to "empty the mind" — only a soft returning, again and again, to the breath and the awareness that holds it.
                </Text>
              </View>

              {/* Tags */}
              <View
                style={{flexDirection:"row",gap:5,flexWrap:"wrap",rowGap:8}}
              >
                <Tag tag="Thought Observation" />
                <Tag tag="Breathing" />
                <Tag tag="Tranquality" />
                <Tag tag="Mindfulness" />
                <Tag tag="Tranquality" />
                <Tag tag="Focus" />
                <Tag tag="Calm" />
              </View>

              <View style={{marginVertical:10}}>
                <Text style={styles.sessionTitleText}>
                  Important: Who This Is For
                </Text>
                <Text style={styles.sessionDescriptionText}>
                  This series is best suited for:{"\n"}
                  {"\u2022"} Practitioners with some meditation experience{"\n"}
                  {"\u2022"} Those who feel stable and grounded in daily life{"\n"}
                  {"\u2022"} Listeners ready for a recognition-based approach rather than technique-based training{"\n"}
                  If you are completely new to meditation, or currently navigating psychological instability, we recommend starting with OmMind’s foundational practices first.
                </Text>
              </View>

              <View style={{marginVertical:10}}>
                <Text style={styles.sessionTitleText}>
                  Source & Integrity
                </Text>
                <Text style={styles.sessionDescriptionText}>
                  This series is inspired by classical Dzogchen teachings from the Nyingma tradition of Tibetan Buddhism, including the root text often known as Wisdom Self-Liberation, traditionally attributed to Guru Padmasambhava.{"\n"}
                  The language has been carefully adapted for modern practitioners while remaining faithful to the core view of the Tibetan lineage.{"\n"}
                  This is not a substitute for traditional transmission, but a respectful and responsible introduction.
                </Text>
              </View>

              <View style={{marginTop:10,marginBottom:40}}>
                <Text style={styles.sessionTitleText}>
                  What You Can Expect
                </Text>
                <Text style={styles.sessionDescriptionText}>
                  {"\u2022"} Clear, direct guidance{"\n"}
                  {"\u2022"} No striving or performance{"\n"}
                  {"\u2022"} Repeated gentle recognition{"\n"}
                  {"\u2022"} Integration into daily life{"\n"}
                  Dzogchen is called the “Great Perfection” because nothing needs to be added.{"\n"}
                  This series simply helps you notice that.
                </Text>
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
