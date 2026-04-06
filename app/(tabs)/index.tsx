import React, { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getAuthInfo } from "@/utils/helper";
import BaseButton from "@/comp/base/BaseButton";
import { FONTS } from "@/theme";

const MEDITATION_ICON = require("@/assets/images/home/meditation_icon.png");
const NOTIFICATION_ICON = require("@/assets/images/home/notification.png");
const HOME_BACKGROUND = require("@/assets/images/home/background_img.png");
const MOON_ICON = require("@/assets/images/home/moon.png");
const CREATE_MEDITATION_ICON = require("@/assets/images/home/create_meditation.png");
const CHAT_ICON = require("@/assets/images/home/chat.png");
const CALM_ICON = require("@/assets/images/home/feelings/calm.png");
const PEACEFUL_ICON = require("@/assets/images/home/feelings/peaceful.png");
const FOCUSED_ICON = require("@/assets/images/home/feelings/focused.png");
const NEUTRAL_ICON = require("@/assets/images/home/feelings/neutral.png");
const UNSURE_ICON = require("@/assets/images/home/feelings/unsure.png");
const INSPIRED_ICON = require("@/assets/images/home/feelings/inspired.png");
const TIRED_ICON = require("@/assets/images/home/feelings/tired.png");
const DRAINED_ICON = require("@/assets/images/home/feelings/drained.png");
const ANXIOUS_ICON = require("@/assets/images/home/feelings/anxious.png");
const HOME_BACKGROUND_ASPECT_RATIO = 1473 / 856;
const FEELING_OPTIONS = [
  { label: "Calm", icon: CALM_ICON },
  { label: "Peaceful", icon: PEACEFUL_ICON },
  { label: "Focused", icon: FOCUSED_ICON },
  { label: "Neutral", icon: NEUTRAL_ICON },
  { label: "Unsure", icon: UNSURE_ICON },
  { label: "Inspired", icon: INSPIRED_ICON },
  { label: "Tired", icon: TIRED_ICON },
  { label: "Drained", icon: DRAINED_ICON },
  { label: "Anxious", icon: ANXIOUS_ICON },
];

const getFirstName = (userName: string | undefined) => {
  const trimmedName = (userName ?? "").trim();
  if (!trimmedName) return "";
  return trimmedName.split(" ")[0];
};

const capitalizeName = (name: string) => {
  const trimmedName = name.trim();
  if (!trimmedName) return "";
  return trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1);
};

const Home = () => {
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const loadUserName = async () => {
      const authInfo = await getAuthInfo();
      setFirstName(capitalizeName(getFirstName(authInfo?.userName)));
    };

    void loadUserName();
  }, []);

  const handleNotificationPress = () => {
    console.log("notification icon pressed");
  };

  const handleCreateMeditationPress = () => {
    console.log("create meditation pressed");
  };

  const handleChatWithLhamoPress = () => {
    console.log("chat with lhamo pressed");
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* header start */}
      <View style={styles.headerRow}>
        <View style={styles.leftContent}>
          <Image source={MEDITATION_ICON} style={styles.avatarIcon} />

          <View style={styles.copyWrap}>
            <Text style={styles.welcomeText}>Welcome!</Text>
            <Text style={styles.nameText}>{firstName || "My Friend"}</Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={handleNotificationPress}>
          <Image source={NOTIFICATION_ICON} style={styles.notificationIcon} />
        </TouchableOpacity>
      </View>
      {/* header finish */}

      <ImageBackground
        source={HOME_BACKGROUND}
        style={styles.heroCard}
        imageStyle={styles.heroCardImage}
      >
        <View style={styles.heroContentColumn}>
          <View style={styles.guidingRow}>
            <Image source={MOON_ICON} style={styles.moonIcon} />
            <Text style={styles.guidingText}>
              <Text style={styles.guidingName}>Lhamo</Text> is guiding you today
            </Text>
          </View>

          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>
              Last time, you practiced grounding.{"\n"}Continue today?
            </Text>
          </View>

          <View style={styles.buttonStack}>
            <BaseButton
              text="Create Meditation"
              height={30}
              fontSize={11}
              onPress={handleCreateMeditationPress}
              useIcon={true}
              icon={<Image source={CREATE_MEDITATION_ICON} style={styles.buttonIcon} />}
              isLoading={false}
              style={styles.primaryButton}
            />
            <BaseButton
              text="Chat with Lhamo"
              height={30}
              fontSize={11}
              onPress={handleChatWithLhamoPress}
              useIcon={true}
              icon={<Image source={CHAT_ICON} style={styles.buttonIcon} />}
              isLoading={false}
              backgroundColor="#FFFFFF"
              fontColor="#4B4748"
              style={styles.secondaryButton}
            />
          </View>
        </View>
      </ImageBackground>

      <View style={styles.bottomDivider} />

      <View style={styles.feelingsSection}>
        <Text style={styles.feelingsTitle}>🍃 How are you feeling right now?</Text>
        <Text style={styles.feelingsSubtitle}>Choose what feels closest</Text>

        <View style={styles.feelingsGrid}>
          {FEELING_OPTIONS.map((feeling) => (
            <TouchableOpacity
              key={feeling.label}
              activeOpacity={0.85}
              style={styles.feelingPill}
            >
              <Image source={feeling.icon} style={styles.feelingIcon} />
              <Text style={styles.feelingLabel}>{feeling.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.bottomDivider} />
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FCFCFB",
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  leftContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarIcon: {
    width: 78,
    height: 78,
    resizeMode: "contain",
  },
  copyWrap: {
    marginLeft: 16,
    flexShrink: 1,
  },
  welcomeText: {
    fontFamily: FONTS.inter,
    fontSize: 22,
    lineHeight: 28,
    color: "#111111",
  },
  nameText: {
    marginTop: 2,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 32,
    lineHeight: 38,
    color: "#111111",
  },
  notificationIcon: {
    width: 64,
    height: 64,
    resizeMode: "contain",
  },
  heroCard: {
    marginTop: 28,
    width: "100%",
    aspectRatio: HOME_BACKGROUND_ASPECT_RATIO,
    overflow: "hidden",
    position: "relative",
  },
  heroCardImage: {
    borderRadius: 28,
    resizeMode: "stretch",
  },
  heroContentColumn: {
    position: "absolute",
    left: "5%",
    top: "9%",
    width: "44%",
    bottom: "10%",
  },
  guidingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  moonIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    marginRight: 6,
  },
  guidingText: {
    flex: 1,
    fontFamily: FONTS.inter,
    fontSize: 12,
    lineHeight: 19,
    color: "#4B4748",
  },
  guidingName: {
    fontFamily: FONTS.figtreeSemiBold,
    color: "#333132",
  },
  messageBubble: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  messageText: {
    fontFamily: FONTS.inter,
    fontSize: 12,
    lineHeight: 14,
    color: "#4E4A4C",
  },
  buttonStack: {
    marginTop: 5,
    gap: 4,
    width: "100%",
  },
  buttonIcon: {
    width: 14,
    height: 14,
    resizeMode: "contain",
  },
  primaryButton: {
    borderRadius: 999,
    width: "100%",
    alignSelf: "flex-start",
  },
  secondaryButton: {
    borderRadius: 999,
    width: "100%",
    alignSelf: "flex-start",
  },
  bottomDivider: {
    marginTop: 26,
    height: 1,
    backgroundColor: "#E5E1DC",
    marginHorizontal: 6,
  },
  feelingsSection: {
    paddingTop: 38,
    paddingHorizontal: 16,
  },
  feelingsTitle: {
    textAlign: "center",
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: "#4B4748",
  },
  feelingsSubtitle: {
    marginTop: 12,
    textAlign: "center",
    fontFamily: FONTS.inter,
    fontSize: 13,
    lineHeight: 18,
    color: "#9A9593",
  },
  feelingsGrid: {
    marginTop: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
  },
  feelingPill: {
    width: "31%",
    minHeight: 54,
    borderWidth: 1,
    borderColor: "#E9D9C9",
    borderRadius: 999,
    backgroundColor: "#FFFEFC",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  feelingIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    marginRight: 8,
  },
  feelingLabel: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 11,
    lineHeight: 15,
    color: "#4B4748",
  },
});
