import FocusSelectionModal from "@/comp/modals/FocusSelectionModal";
import { useUserApi } from "@/api/api";
import { RecentlyAccessedSession } from "@/api/types";
import ProfilePhotoUploadModal from "@/comp/modals/ProfilePhotoUploadModal";
import MeditationSessionCard from "@/comp/meditation_session/MeditationSessionCard";
import { FONTS } from "@/theme";
import {
  checkIfLambdaResultIsSuccess,
  getLambdaErrorMessage,
  getProfilePhotoUri,
  storeProfilePhotoUri,
} from "@/utils/helper";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DEFAULT_PROFILE_IMAGE = require("@/assets/images/home/meditation_icon.png");
const PENCIL_ICON = require("@/assets/images/profile/pencil.png");
const RED_ICON = require("@/assets/images/profile/red.png");
const YELLOW_ICON = require("@/assets/images/profile/yellow.png");
const BLUE_ICON = require("@/assets/images/profile/blue.png");
const CHANGE_FOCUS_ICON = require("@/assets/images/profile/change_focus_icon.png");
const MANAGE_SUBSCRIPTIONS_ICON = require("@/assets/images/profile/manage_subscriptions.png");
const REPORT_A_BUG_ICON = require("@/assets/images/profile/report_a_bug.png");
const SUGGEST_AN_IMPROVEMENT_ICON = require("@/assets/images/profile/suggest_an_improvement.png");
const CONTACT_US_ICON = require("@/assets/images/profile/contact_us.png");
const YOUTUBE_ICON = require("@/assets/images/profile/youtube.png");
const TIKTOK_ICON = require("@/assets/images/profile/tiktok.png");
const INSTAGRAM_ICON = require("@/assets/images/profile/instagram.png");
const MAX_PROFILE_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PROFILE_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_PROFILE_PHOTO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

type AccountDetails = {
  average_meditation_time_in_mins: number | null;
  current_focus: string[] | string | null;
  email: string;
  name: string;
  number_of_sessions_completed: number | null;
  profile_pic: string | null;
  recently_accessed_sessions: RecentlyAccessedSession[];
  total_meditation_time_in_mins: number | null;
};

const DEFAULT_ACCOUNT_DETAILS: AccountDetails = {
  average_meditation_time_in_mins: 0,
  current_focus: null,
  email: "",
  name: "",
  number_of_sessions_completed: 0,
  profile_pic: null,
  recently_accessed_sessions: [],
  total_meditation_time_in_mins: 0,
};

const formatStatValue = (value: number | null | undefined) => `${value ?? 0}`;
const formatHoursFromMinutes = (value: number | null | undefined) => {
  if (!value) return "0";

  const totalHours = value / 60;
  return Number.isInteger(totalHours) ? `${totalHours}` : totalHours.toFixed(1);
};
const normalizeCurrentFocus = (value: string[] | string | null | undefined): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value
      .split(/[•,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const formatCurrentFocus = (value: string[] | string | null | undefined) => {
  const focusItems = normalizeCurrentFocus(value);
  return focusItems.length ? focusItems.join(" • ") : "No focus selected";
};

const Profile = () => {
  const router = useRouter();
  const {
    getAccountDetails: { getAccountDetails },
    updateUserCurrentFocus: { updateUserCurrentFocus },
    uploadProfilePic: { uploadProfilePic },
  } = useUserApi();
  const [accountDetails, setAccountDetails] = React.useState<AccountDetails>(DEFAULT_ACCOUNT_DETAILS);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isProfileModalVisible, setIsProfileModalVisible] = React.useState(false);
  const [localProfilePhotoUri, setLocalProfilePhotoUri] = React.useState<string | null>(null);
  const [pendingProfilePhotoUri, setPendingProfilePhotoUri] = React.useState<string | null>(null);
  const [pendingProfilePhotoBase64, setPendingProfilePhotoBase64] = React.useState<string | null>(null);
  const [profilePhotoError, setProfilePhotoError] = React.useState("");
  const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = React.useState(false);
  const [isFocusModalVisible, setIsFocusModalVisible] = React.useState(false);
  const [isUpdatingFocus, setIsUpdatingFocus] = React.useState(false);

  React.useEffect(() => {
    const loadStoredProfilePhoto = async () => {
      const storedUri = await getProfilePhotoUri();
      if (storedUri) {
        setLocalProfilePhotoUri(storedUri);
      }
    };

    void loadStoredProfilePhoto();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const loadAccountDetails = async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
          const result = await getAccountDetails();
          console.log("getAccountDetails result", result);
          console.log("recently_accessed_sessions", result.data?.recently_accessed_sessions);

          if (!checkIfLambdaResultIsSuccess(result)) {
            setErrorMessage(getLambdaErrorMessage(result));
            return;
          }

          setAccountDetails({
            ...DEFAULT_ACCOUNT_DETAILS,
            ...result.data,
            recently_accessed_sessions: result.data?.recently_accessed_sessions ?? [],
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

      setLocalProfilePhotoUri(updatedProfilePhotoUri);
      setAccountDetails({
        ...DEFAULT_ACCOUNT_DETAILS,
        ...accountDetailsResult.data,
        recently_accessed_sessions: accountDetailsResult.data.recently_accessed_sessions ?? [],
      });
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

  const handleChangeFocusPress = () => {
    setIsFocusModalVisible(true);
  };

  const handleCloseFocusModal = () => {
    setIsFocusModalVisible(false);
  };

  const handleConfirmFocusPress = async (selectedFocusItems: string[]) => {
    setIsUpdatingFocus(true);

    try {
      const updateResult = await updateUserCurrentFocus({
        current_focus: selectedFocusItems,
      });

      if (!checkIfLambdaResultIsSuccess(updateResult)) {
        Alert.alert("Unable to update focus", getLambdaErrorMessage(updateResult));
        return;
      }

      setAccountDetails((currentDetails: AccountDetails) => ({
        ...currentDetails,
        current_focus: updateResult.data?.current_focus ?? selectedFocusItems,
      }));
      setIsFocusModalVisible(false);
    } catch (error) {
      console.error("Failed to update current focus", error);
      Alert.alert("Unable to update focus", "Please try again.");
    } finally {
      setIsUpdatingFocus(false);
    }
  };

  const handleSessionPress = (item: RecentlyAccessedSession) => {
    const isGenerated = item.is_generated === 1;

    router.push({
      pathname: "/meditation_session/player",
      params: {
        type: item.type,
        course_number: item.course_number == null ? "" : String(item.course_number),
        session_number: item.session_number == null ? "" : String(item.session_number),
        title: item.session_title,
        image_url: item.image_url ?? "",
        backgroundUrl: item.background_url ?? "",
        progress: item.session_progress_in_secs == null ? "" : String(item.session_progress_in_secs),
        is_generated: isGenerated ? "1" : "0",
        message_id: item.message_id == null ? "" : String(item.message_id),
      },
    });
  };

  const handleProfileMenuItemPress = () => {
    // Functionality for these menu items will be wired up later.
  };

  const handleSocialButtonPress = () => {
    // Social links will be wired up later.
  };

  const profileImageSource: ImageSourcePropType = pendingProfilePhotoUri
    ? { uri: pendingProfilePhotoUri }
    : localProfilePhotoUri
      ? { uri: localProfilePhotoUri }
      : accountDetails.profile_pic
        ? { uri: accountDetails.profile_pic }
        : DEFAULT_PROFILE_IMAGE;
  const currentFocusText = formatCurrentFocus(accountDetails.current_focus);
  const selectedFocusItems = normalizeCurrentFocus(accountDetails.current_focus);
  const recentlyPlayedSessions = accountDetails.recently_accessed_sessions ?? [];
  const menuItems: { label: string; icon?: ImageSourcePropType }[] = [
    { label: "Saved" },
    { label: "Manage subscriptions", icon: MANAGE_SUBSCRIPTIONS_ICON },
    { label: "Report a bug", icon: REPORT_A_BUG_ICON },
    { label: "Suggest an improvement", icon: SUGGEST_AN_IMPROVEMENT_ICON },
    { label: "Contact us", icon: CONTACT_US_ICON },
  ];
  const socialItems: { label: string; icon: ImageSourcePropType }[] = [
    { label: "YouTube", icon: YOUTUBE_ICON },
    { label: "TikTok", icon: TIKTOK_ICON },
    { label: "Instagram", icon: INSTAGRAM_ICON },
  ];

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
    <>
      <ScrollView contentContainerStyle={styles.contentContainer} style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#B88A1A" size="large" />
          </View>
        ) : null}

        <View style={styles.headerSection}>
          <TouchableOpacity activeOpacity={0.85} onPress={handleProfilePress}>
            <View style={styles.avatarBorder}>
              <Image source={profileImageSource} style={styles.avatarImage} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} onPress={handleProfilePress} style={styles.nameRow}>
            <Text style={styles.nameText}>{accountDetails.name || "Profile"}</Text>
            <Image source={PENCIL_ICON} style={styles.pencilIcon} />
          </TouchableOpacity>

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

        <View style={styles.focusSection}>
          <View style={styles.focusIconWrap}>
            <Image source={CHANGE_FOCUS_ICON} style={styles.focusIcon} />
          </View>

          <Text style={styles.focusTitle}>Your current focus</Text>
          <Text style={styles.focusValue}>{currentFocusText}</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.changeFocusButton}
            onPress={handleChangeFocusPress}
          >
            <Text style={styles.changeFocusButtonText}>Change focus</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentlyPlayedSection}>
          <View style={styles.recentlyPlayedHeader}>
            <Text style={styles.recentlyPlayedTitle}>Recently Played</Text>
            <Text style={styles.recentlyPlayedArrow}>→</Text>
          </View>

          <FlatList
            horizontal
            data={recentlyPlayedSessions}
            keyExtractor={(item) => `${item.type}-${item.course_number}-${item.session_number}-${item.id}`}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentlyPlayedRow}
            renderItem={({ item }) => (
              <MeditationSessionCard
                session_length={item.session_length_in_mins ?? 0}
                session_title={item.session_title}
                image_url={item.image_url ?? undefined}
                session_progress={item.session_progress_in_secs}
                onPress={() => void handleSessionPress(item)}
                generated_meditation={item.is_generated}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.recentlyPlayedEmptyText}>No recently played sessions yet.</Text>
            }
          />
        </View>

        <View style={styles.profileMenuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.85}
              onPress={handleProfileMenuItemPress}
              style={[styles.profileMenuItem, !item.icon && styles.profileMenuItemTextOnly]}
            >
              {item.icon ? <Image source={item.icon} style={styles.profileMenuIcon} /> : null}
              <Text style={styles.profileMenuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.followSection}>
          <Text style={styles.followTitle}>Follow OmMind</Text>
          <View style={styles.socialButtonRow}>
            {socialItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={handleSocialButtonPress}
                style={styles.socialButton}
              >
                <Image source={item.icon} style={styles.socialIcon} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
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

      <FocusSelectionModal
        visible={isFocusModalVisible}
        onClose={handleCloseFocusModal}
        initialSelectedFocusItems={selectedFocusItems}
        onConfirm={handleConfirmFocusPress}
        isSubmitting={isUpdatingFocus}
      />
    </>
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
  focusSection: {
    marginTop: 18,
    paddingTop: 28,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#E7E0D7",
    alignItems: "center",
  },
  focusIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F1ECE4",
    alignItems: "center",
    justifyContent: "center",
  },
  focusIcon: {
    width: 34,
    height: 34,
    resizeMode: "contain",
  },
  focusTitle: {
    marginTop: 16,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: "#111111",
    textAlign: "center",
  },
  focusValue: {
    marginTop: 6,
    fontFamily: FONTS.inter,
    fontSize: 15,
    lineHeight: 22,
    color: "#999999",
    textAlign: "center",
    fontStyle: "italic",
  },
  changeFocusButton: {
    marginTop: 18,
    minWidth: 186,
    minHeight: 44,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: "#595959",
    alignItems: "center",
    justifyContent: "center",
  },
  changeFocusButtonText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 16,
    lineHeight: 20,
    color: "#FFFFFF",
  },
  recentlyPlayedSection: {
    marginTop: 18,
    paddingTop: 28,
    borderTopWidth: 1,
    borderTopColor: "#E7E0D7",
  },
  recentlyPlayedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recentlyPlayedTitle: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: "#111111",
  },
  recentlyPlayedArrow: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 28,
    lineHeight: 28,
    color: "#6D6965",
  },
  recentlyPlayedRow: {
    gap: 12,
    paddingTop: 16,
    paddingRight: 12,
  },
  recentlyPlayedEmptyText: {
    fontFamily: FONTS.inter,
    fontSize: 14,
    lineHeight: 20,
    color: "#8B8B8B",
  },
  profileMenuSection: {
    marginTop: 28,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E7E0D7",
    gap: 12,
  },
  profileMenuItem: {
    minHeight: 56,
    borderRadius: 10,
    backgroundColor: "#E4E4E8",
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  profileMenuItemTextOnly: {
    paddingLeft: 24,
  },
  profileMenuIcon: {
    width: 30,
    height: 30,
    marginRight: 16,
    resizeMode: "contain",
  },
  profileMenuText: {
    flex: 1,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 18,
    lineHeight: 28,
    color: "#686B72",
  },
  followSection: {
    marginTop: 36,
    paddingTop: 28,
    marginBottom:100,
    borderTopWidth: 1,
    borderTopColor: "#E7E0D7",
    alignItems: "center",
  },
  followTitle: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 22,
    lineHeight: 28,
    color: "#686B72",
    textAlign: "center",
  },
  socialButtonRow: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 64,
    height: 64,
    resizeMode: "contain",
  },
});
