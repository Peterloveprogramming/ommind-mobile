import { useUserApi } from "@/api/api";
import { GetAccountDetailsResult } from "@/api/types";
import { FONTS } from "@/theme";
import { checkIfLambdaResultIsSuccess, getLambdaErrorMessage } from "@/utils/helper";
import { useFocusEffect } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const DEFAULT_PROFILE_IMAGE = require("@/assets/images/home/meditation_icon.png");
const PENCIL_ICON = require("@/assets/images/profile/pencil.png");
const RED_ICON = require("@/assets/images/profile/red.png");
const YELLOW_ICON = require("@/assets/images/profile/yellow.png");
const BLUE_ICON = require("@/assets/images/profile/blue.png");

type AccountDetails = NonNullable<GetAccountDetailsResult["data"]>;

const DEFAULT_ACCOUNT_DETAILS: AccountDetails = {
  average_meditation_time_in_mins: 0,
  current_focus: null,
  email: "",
  name: "",
  number_of_sessions_completed: 0,
  profile_pic: null,
  total_meditation_time_in_mins: 0,
};

const formatStatValue = (value: number | null | undefined) => `${value ?? 0}`;
const formatHoursFromMinutes = (value: number | null | undefined) => {
  if (!value) return "0";

  const totalHours = value / 60;
  return Number.isInteger(totalHours) ? `${totalHours}` : totalHours.toFixed(1);
};

const Profile = () => {
  const {
    getAccountDetails: { getAccountDetails },
  } = useUserApi();
  const [accountDetails, setAccountDetails] = React.useState<AccountDetails>(DEFAULT_ACCOUNT_DETAILS);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");

  useFocusEffect(
    React.useCallback(() => {
      const loadAccountDetails = async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
          const result = await getAccountDetails();
          console.log("getAccountDetails result", result);

          if (!checkIfLambdaResultIsSuccess(result)) {
            setErrorMessage(getLambdaErrorMessage(result));
            return;
          }

          setAccountDetails({
            ...DEFAULT_ACCOUNT_DETAILS,
            ...result.data,
          });
        } catch (error) {
          console.error("Failed to fetch account details", error);
          setErrorMessage("Unable to load profile details right now.");
        } finally {
          setIsLoading(false);
        }
      };

      void loadAccountDetails();
    }, [])
  );

  const profileImageSource: ImageSourcePropType = accountDetails.profile_pic
    ? { uri: accountDetails.profile_pic }
    : DEFAULT_PROFILE_IMAGE;

  const statCards = [
    {
      title: "Average Meditation Time",
      value: formatStatValue(accountDetails.average_meditation_time_in_mins),
      unit: "Minutes",
      icon: RED_ICON,
    },
    {
      title: "Total Meditation Time",
      value: formatHoursFromMinutes(accountDetails.total_meditation_time_in_mins),
      unit: "Hours",
      icon: YELLOW_ICON,
    },
    {
      title: "Completed",
      value: formatStatValue(accountDetails.number_of_sessions_completed),
      unit: "Sessions",
      icon: BLUE_ICON,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#B88A1A" size="large" />
        </View>
      ) : null}

      <View style={styles.headerSection}>
        <View style={styles.avatarBorder}>
          <Image source={profileImageSource} style={styles.avatarImage} />
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.nameText}>{accountDetails.name || "Profile"}</Text>
          <Image source={PENCIL_ICON} style={styles.pencilIcon} />
        </View>

        {accountDetails.email ? <Text style={styles.emailText}>{accountDetails.email}</Text> : null}
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>

      <View style={styles.statsRow}>
        {statCards.map((card) => (
          <View key={card.title} style={styles.statCard}>
            <Text style={styles.statTitle}>{card.title}</Text>
            <View style={styles.statFooter}>
              <View style={styles.statIconWrap}>
                <Image source={card.icon} style={styles.statBadgeImage} />
              </View>
              <View style={styles.statValueWrap}>
                <Text style={styles.statValue}>{card.value}</Text>
                <Text style={styles.statUnit}>{card.unit}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F2EA",
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 32,
  },
  loadingWrap: {
    position: "absolute",
    top: 32,
    right: 24,
    zIndex: 1,
  },
  headerSection: {
    alignItems: "center",
  },
  avatarBorder: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 1.5,
    borderColor: "#E1AE2D",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FBF8F2",
  },
  avatarImage: {
    width: 122,
    height: 122,
    borderRadius: 61,
    resizeMode: "cover",
  },
  nameRow: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  nameText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 22,
    lineHeight: 28,
    color: "#111111",
  },
  pencilIcon: {
    width: 22,
    height: 22,
    marginLeft: 8,
    resizeMode: "contain",
  },
  emailText: {
    marginTop: 6,
    fontFamily: FONTS.inter,
    fontSize: 13,
    lineHeight: 18,
    color: "#6D6965",
  },
  errorText: {
    marginTop: 10,
    textAlign: "center",
    fontFamily: FONTS.inter,
    fontSize: 13,
    lineHeight: 18,
    color: "#B73A45",
  },
  statsRow: {
    marginTop: 34,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    minHeight: 156,
    borderRadius: 24,
    backgroundColor: "#B6B6B8",
    paddingHorizontal: 10,
    paddingTop: 18,
    paddingBottom: 14,
    justifyContent: "space-between",
    marginHorizontal: 3,
  },
  statTitle: {
    fontFamily: FONTS.inter,
    fontSize: 13,
    lineHeight: 17,
    color: "#FFFFFF",
  },
  statFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-evenly",
    marginTop: 10,
  },
  statIconWrap: {
    width: 34,
    alignItems: "flex-start",
  },
  statBadgeImage: {
    width: 34,
    height: 34,
    resizeMode: "contain",
  },
  statValueWrap: {
    alignItems: "flex-end",
    marginLeft: 4,
  },
  statValue: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 18,
    lineHeight: 22,
    color: "#FFFFFF",
  },
  statUnit: {
    marginTop: 2,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 10,
    lineHeight: 12,
    color: "#FFFFFF",
    textAlign: "right",
  },
});
