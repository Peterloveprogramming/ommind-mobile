import { useUserApi } from "@/api/api";
import ProfilePhotoUploadModal from "@/comp/modals/ProfilePhotoUploadModal";
import { FONTS } from "@/theme";
import {
  checkIfLambdaResultIsSuccess,
  getLambdaErrorMessage,
  getProfilePhotoUri,
  storeProfilePhotoUri,
} from "@/utils/helper";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
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
const MAX_PROFILE_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PROFILE_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_PROFILE_PHOTO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

type AccountDetails = {
  average_meditation_time_in_mins: number | null;
  current_focus: string | null;
  email: string;
  name: string;
  number_of_sessions_completed: number | null;
  profile_pic: string | null;
  total_meditation_time_in_mins: number | null;
};

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
const formatCurrentFocus = (value: string | null | undefined) => value?.trim() || "Healing • Compassion";

const Profile = () => {
  const {
    getAccountDetails: { getAccountDetails },
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

      setLocalProfilePhotoUri(pendingProfilePhotoUri);
      setAccountDetails((currentDetails: AccountDetails) => ({
        ...currentDetails,
        profile_pic: pendingProfilePhotoUri,
      }));
      await storeProfilePhotoUri(pendingProfilePhotoUri);
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

  const profileImageSource: ImageSourcePropType = pendingProfilePhotoUri
    ? { uri: pendingProfilePhotoUri }
    : localProfilePhotoUri
      ? { uri: localProfilePhotoUri }
      : accountDetails.profile_pic
        ? { uri: accountDetails.profile_pic }
        : DEFAULT_PROFILE_IMAGE;
  const currentFocusText = formatCurrentFocus(accountDetails.current_focus);

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

          <TouchableOpacity activeOpacity={0.85} style={styles.changeFocusButton}>
            <Text style={styles.changeFocusButtonText}>Change focus</Text>
          </TouchableOpacity>
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
});
