import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, usePathname, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useUserApi } from "@/api/api";
import MeditationCard from "@/comp/explore/MeditationCard";
import { MeditationCourse } from "@/api/lambda/meditation/types";
import {
  checkIfLambdaResultIsSuccess,
  deleteFromCache,
  deleteProfilePhotoUri,
  getLambdaErrorMessage,
  getAuthInfo,
  getProfilePhotoUri,
  navigateToNewChat,
  storeProfilePhotoUri,
} from "@/utils/helper";
import BaseButton from "@/comp/base/BaseButton";
import { FONTS } from "@/theme";
import { useMeditationCourses } from "@/services/meditation/useMeditationCourses";
import ProfilePhotoUploadModal from "@/comp/modals/ProfilePhotoUploadModal";

const MEDITATION_ICON = require("@/assets/images/home/meditation_icon.png");
const NOTIFICATION_ICON = require("@/assets/images/home/notification.png");
const HOME_BACKGROUND = require("@/assets/images/home/background_img.png");
const MOON_ICON = require("@/assets/images/home/moon.png");
const CREATE_MEDITATION_ICON = require("@/assets/images/home/create_meditation.png");
const CHAT_ICON = require("@/assets/images/home/chat.png");
const SKY_BACKGROUND = require("@/assets/images/home/sky.png");
const LOTUS_ICON = require("@/assets/images/home/lotus.png");
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
const MAX_PROFILE_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PROFILE_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_PROFILE_PHOTO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

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
  const router = useRouter();
  const pathname = usePathname();
  const [firstName, setFirstName] = useState("");
  const [selectedFeeling, setSelectedFeeling] = useState("");
  const [recommendedCourses, setRecommendedCourses] = useState<MeditationCourse[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [profileImageSource, setProfileImageSource] = useState<ImageSourcePropType>(MEDITATION_ICON);
  const [pendingProfilePhotoUri, setPendingProfilePhotoUri] = useState<string | null>(null);
  const [pendingProfilePhotoBase64, setPendingProfilePhotoBase64] = useState<string | null>(null);
  const [profilePhotoError, setProfilePhotoError] = useState("");
  const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { fetchRecommendedMeditationCourses, trackRecentlyAccessedCourse } = useMeditationCourses();
  const {
    uploadProfilePic: { uploadProfilePic },
  } = useUserApi();

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const loadUserName = async () => {
      const authInfo = await getAuthInfo();
      setFirstName(capitalizeName(getFirstName(authInfo?.userName)));
    };

    void loadUserName();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const loadStoredProfilePhoto = async () => {
        const storedUri = await getProfilePhotoUri();
        setProfileImageSource(storedUri ? { uri: storedUri } : MEDITATION_ICON);
      };

      const loadRecommendedMeditationCourses = async () => {
        try {
          const response = await fetchRecommendedMeditationCourses();
          const courses = response.data?.courses ?? [];
          setRecommendedCourses(courses);
          console.log("recommended meditation courses", courses);
        } catch (error) {
          console.error("Failed to load recommended meditation courses", error);
        }
      };

      void loadStoredProfilePhoto();
      void loadRecommendedMeditationCourses();
    }, [fetchRecommendedMeditationCourses])
  );

  const handleNotificationPress = () => {
    console.log("notification icon pressed");
  };

  const handleProfilePress = () => {
    setProfilePhotoError("");
    setPendingProfilePhotoUri(null);
    setPendingProfilePhotoBase64(null);
    setIsProfileModalVisible(true);
  };

  const handleCloseProfileModal = () => {
    setProfilePhotoError("");
    setPendingProfilePhotoUri(null);
    setPendingProfilePhotoBase64(null);
    setIsProfileModalVisible(false);
  };

  const isAcceptedProfilePhotoAsset = (asset: ImagePicker.ImagePickerAsset) => {
    const mimeType = asset.mimeType?.toLowerCase();
    const fileName = asset.fileName?.toLowerCase() ?? "";

    const hasAcceptedMimeType = mimeType
      ? ACCEPTED_PROFILE_PHOTO_MIME_TYPES.includes(mimeType)
      : false;
    const hasAcceptedExtension = ACCEPTED_PROFILE_PHOTO_EXTENSIONS.some((extension) =>
      fileName.endsWith(extension)
    );

    return hasAcceptedMimeType || hasAcceptedExtension;
  };

  const handleChooseProfilePhotoPress = async () => {
    setProfilePhotoError("");
    setIsUploadingProfilePhoto(true);

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        const message = "Photo library permission is required to upload a profile photo.";
        setProfilePhotoError(message);
        Alert.alert("Permission needed", message);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        base64: true,
        quality: 0.9,
      });

      if (result.canceled || !result.assets.length) {
        return;
      }

      const selectedAsset = result.assets[0];

      if (!isAcceptedProfilePhotoAsset(selectedAsset)) {
        setProfilePhotoError("Only JPG, PNG, and WEBP files are accepted.");
        return;
      }

      if ((selectedAsset.fileSize ?? 0) > MAX_PROFILE_PHOTO_SIZE_BYTES) {
        setProfilePhotoError("Profile photo must not exceed 5MB.");
        return;
      }

      if (!selectedAsset.base64) {
        setProfilePhotoError("Unable to prepare this photo for upload.");
        return;
      }

      setPendingProfilePhotoUri(selectedAsset.uri);
      setPendingProfilePhotoBase64(selectedAsset.base64);
    } catch (error) {
      console.error("Failed to pick profile photo", error);
      setProfilePhotoError("Unable to upload profile photo right now. Please try again.");
    } finally {
      setIsUploadingProfilePhoto(false);
    }
  };

  const handleConfirmProfilePhotoPress = async () => {
    if (!pendingProfilePhotoUri || !pendingProfilePhotoBase64) {
      return;
    }

    setProfilePhotoError("");
    setIsUploadingProfilePhoto(true);

    try {
      const uploadResult = await uploadProfilePic({ image: pendingProfilePhotoBase64 });

      if (!checkIfLambdaResultIsSuccess(uploadResult)) {
        setProfilePhotoError(getLambdaErrorMessage(uploadResult));
        return;
      }

      const accountDetailsResult = await getAccountDetails();

      if (!checkIfLambdaResultIsSuccess(accountDetailsResult) || !accountDetailsResult.data) {
        setProfilePhotoError("Profile photo was uploaded, but the updated profile could not be loaded.");
        return;
      }

      const updatedProfilePhotoUri = accountDetailsResult.data.profile_pic ?? pendingProfilePhotoUri;

      setFirstName(capitalizeName(getFirstName(accountDetailsResult.data.name)));
      setProfileImageSource({ uri: updatedProfilePhotoUri });
      await storeProfilePhotoUri(updatedProfilePhotoUri);
      setPendingProfilePhotoUri(null);
      setPendingProfilePhotoBase64(null);
      setIsProfileModalVisible(false);
    } catch (error) {
      console.error("Failed to save profile photo", error);
      setProfilePhotoError("Unable to save profile photo right now. Please try again.");
    } finally {
      setIsUploadingProfilePhoto(false);
    }
  };

  const handleCreateMeditationPress = () => {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);
    setTimeout(() => {
      setIsNavigating(false);
    }, 1500);
    navigateToNewChat(router);
  };

  const handleChatWithLhamoPress = () => {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);
    setTimeout(() => {
      setIsNavigating(false);
    }, 1500);
    navigateToNewChat(router);
  };

  const handleRefreshGuidancePress = () => {
    console.log("refresh guidance pressed");
  };

  const handleCoursePress = async (item: MeditationCourse) => {
    try {
      const trackResult = await trackRecentlyAccessedCourse(item.course_id);

      if (!checkIfLambdaResultIsSuccess(trackResult)) {
        console.warn("Failed to add recently accessed course", trackResult);
      }
    } catch (error) {
      console.error("Failed to add recently accessed course", error);
    } finally {
      router.push({
        pathname: "/meditation_session/session",
        params: {
          uuid: item.uuid,
          type: item.type,
          course_number: String(item.course_number),
        },
      });
    }
  };

  const handleLogoutPress = () => {
    if (isLoggingOut) {
      return;
    }

    Alert.alert("Log out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);

          try {
            await deleteFromCache("authInfo");
            await deleteProfilePhotoUri();
            setProfileImageSource(MEDITATION_ICON);
            setPendingProfilePhotoUri(null);
            setPendingProfilePhotoBase64(null);
            setProfilePhotoError("");
            setIsProfileModalVisible(false);
            router.replace("/welcome");
          } catch (error) {
            console.error("Failed to log out", error);
            Alert.alert("Unable to log out", "Please try again.");
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.leftContent}>
            <TouchableOpacity activeOpacity={0.85} onPress={handleProfilePress}>
              <Image source={profileImageSource} style={styles.avatarIcon} />
            </TouchableOpacity>

            <View style={styles.copyWrap}>
              <Text style={styles.welcomeText}>Welcome!</Text>
              <Text style={styles.nameText}>{firstName || "My Friend"}</Text>
            </View>
            
          </View>
          

          <View style={styles.headerActions}>
  
            <TouchableOpacity activeOpacity={0.8} onPress={handleNotificationPress}>
              <Image source={NOTIFICATION_ICON} style={styles.notificationIcon} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{
          width:"25%",
          marginTop:10,
        }}>
          <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLogoutPress}
              style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
              disabled={isLoggingOut}
            >
              <Text style={styles.logoutButtonText}>Log out</Text>
            </TouchableOpacity>
        </View>

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
                fontSize={13}
                onPress={handleCreateMeditationPress}
                useIcon={true}
                icon={<Image source={CREATE_MEDITATION_ICON} style={styles.buttonIcon} />}
                isLoading={isNavigating}
                style={styles.primaryButton}
              />
              <BaseButton
                text="Chat with Lhamo"
                height={30}
                fontSize={13}
                onPress={handleChatWithLhamoPress}
                useIcon={true}
                icon={<Image source={CHAT_ICON} style={styles.buttonIcon} />}
                isLoading={isNavigating}
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
                style={[
                  styles.feelingPill,
                  selectedFeeling === feeling.label && styles.feelingPillSelected,
                ]}
                onPress={() => setSelectedFeeling(feeling.label)}
              >
                <Image source={feeling.icon} style={styles.feelingIcon} />
                <Text
                  style={[
                    styles.feelingLabel,
                    selectedFeeling === feeling.label && styles.feelingLabelSelected,
                  ]}
                >
                  {feeling.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomDivider} />

        <View style={styles.intentionSection}>
          <Text style={styles.intentionTitle}>✨ Today&apos;s Intention</Text>

          <ImageBackground
            source={SKY_BACKGROUND}
            style={styles.intentionCard}
            imageStyle={styles.intentionCardImage}
          >
            <Text style={styles.intentionLead}>
              Lhamo senses how you&apos;re feeling...{"\n"}and gently suggests:
            </Text>

            <Text style={styles.intentionWord}>Compassion</Text>

            <View style={styles.intentionDivider} />

            <Text style={styles.affirmationLead}>Lhamo&apos;s Affirmation for you</Text>

            <Text style={styles.affirmationText}>
              “I am grounded and soft with myself today.”
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.refreshButton}
              onPress={handleRefreshGuidancePress}
            >
              <Image source={LOTUS_ICON} style={styles.refreshIcon} />
              <Text style={styles.refreshButtonText}>Refresh Guidance</Text>
            </TouchableOpacity>
          </ImageBackground>
        </View>

        {recommendedCourses.length ? (
          <View style={styles.practiceSection}>
            <Text style={styles.practiceTitle}>Your Practice Today</Text>
            <View style={styles.practiceCardWrap}>
              <FlatList
                horizontal
                data={recommendedCourses}
                keyExtractor={(item) => item.uuid}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.practiceCardsRow}
                renderItem={({ item }) => (
                  <MeditationCard
                    numberOfSessions={item.number_of_sessions}
                    description={`${item.proper_type_name} ${item.course_number}: ${item.title}`}
                    image_source={item.image_url}
                    onPress={() => void handleCoursePress(item)}
                  />
                )}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.bottomDivider} />
      </ScrollView>

      <ProfilePhotoUploadModal
        visible={isProfileModalVisible}
        onClose={handleCloseProfileModal}
        previewSource={pendingProfilePhotoUri ? { uri: pendingProfilePhotoUri } : profileImageSource}
        title={pendingProfilePhotoUri ? "Confirm profile photo" : "Upload profile photo"}
        subtitle={
          pendingProfilePhotoUri
            ? "Review the selected image, then confirm to save it as your profile picture."
            : "Choose a photo from your device for your profile picture."
        }
        primaryActionLabel={pendingProfilePhotoUri ? "Confirm photo" : "Upload photo"}
        secondaryActionLabel={pendingProfilePhotoUri ? "Choose another photo" : undefined}
        helperText={
          pendingProfilePhotoUri
            ? "Tap Confirm photo to save this image, or choose another photo."
            : "Accepted formats: JPG, PNG, WEBP. Maximum file size: 5MB."
        }
        errorText={profilePhotoError}
        isLoading={isUploadingProfilePhoto}
        onPrimaryPress={
          pendingProfilePhotoUri ? handleConfirmProfilePhotoPress : handleChooseProfilePhotoPress
        }
        onSecondaryPress={pendingProfilePhotoUri ? handleChooseProfilePhotoPress : undefined}
      />
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FCFCFB",
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingVertical: 100,
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
    resizeMode: "cover",
    borderRadius: 39,
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoutButton: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DED6CC",
    backgroundColor: "#FFFDF9",
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: "#4B4748",
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
    fontSize: 13,
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
    fontSize: 13,
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
    marginVertical: 3,
  },
  secondaryButton: {
    borderRadius: 999,
    width: "100%",
    alignSelf: "flex-start",
    marginVertical: 3,
  },
  bottomDivider: {
    marginTop: 26,
    height: 1,
    backgroundColor: "#E5E1DC",
    marginHorizontal: 6,
  },
  feelingsSection: {
    paddingTop: 38,
    paddingHorizontal: 20,
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
  feelingPillSelected: {
    backgroundColor: "#F7C648",
    borderColor: "#F7C648",
  },
  feelingIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
    marginRight: 2,
  },
  feelingLabel: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 14,
    lineHeight: 17,
    color: "#4B4748",
  },
  feelingLabelSelected: {
    color: "#4B4748",
  },
  intentionSection: {
    paddingTop: 28,
  },
  intentionTitle: {
    textAlign: "center",
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 17,
    lineHeight: 22,
    color: "#4B4748",
  },
  intentionCard: {
    marginTop: 22,
    height: 250,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  intentionCardImage: {
    borderRadius: 28,
    resizeMode: "cover",
  },
  intentionLead: {
    textAlign: "center",
    fontFamily: FONTS.figtreeMedium,
    fontSize: 13,
    lineHeight: 18,
    color: "#98938F",
  },
  intentionWord: {
    marginTop: 6,
    textAlign: "center",
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 22,
    lineHeight: 28,
    color: "#111111",
  },
  intentionDivider: {
    marginTop: 14,
    width: "115%",
    height: 1,
    backgroundColor: "rgba(222, 216, 208, 0.9)",
  },
  affirmationLead: {
    marginTop: 12,
    textAlign: "center",
    fontFamily: FONTS.figtreeMedium,
    fontSize: 12,
    lineHeight: 16,
    color: "#98938F",
  },
  affirmationText: {
    marginTop: 10,
    textAlign: "center",
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: "#111111",
  },
  refreshButton: {
    marginTop: 16,
    minHeight: 42,
    borderRadius: 999,
    backgroundColor: "rgba(175, 171, 169, 0.95)",
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginRight: 8,
  },
  refreshButtonText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: "#FFFFFF",
  },
  practiceSection: {
    paddingTop: 28,
    paddingHorizontal: 20,
  },
  practiceTitle: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: "#111111",
  },
  practiceCardWrap: {
    marginTop: 18,
  },
  practiceCardsRow: {
    paddingRight: 15,
    gap: 12,
  },
});
