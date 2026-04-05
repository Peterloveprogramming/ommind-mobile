import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getAuthInfo } from "@/utils/helper";
import { FONTS } from "@/theme";

const MEDITATION_ICON = require("@/assets/images/home/meditation_icon.png");
const NOTIFICATION_ICON = require("@/assets/images/home/notification.png");

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

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
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
    marginTop: 4,
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
});
