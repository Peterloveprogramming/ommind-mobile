import { useUserApi } from "@/api/api";
import { RecentlyAccessedSession } from "@/api/types";
import ProfileDetailsModal, { ProfileDetailsForm } from "@/comp/modals/ProfileDetailsModal";
import ProfilePhotoUploadModal from "@/comp/modals/ProfilePhotoUploadModal";
import MeditationSessionCard from "@/comp/meditation_session/MeditationSessionCard";
import ProfileContactForm from "@/comp/profile/ProfileContactForm";
import ProfileFeedbackForm from "@/comp/profile/ProfileFeedbackForm";
import GradientDivider from "@/comp/home/GradientDivider";
import TestButtons from "@/development_testing/comp/TestButtons";
import { IS_DEVELOPMENT_ENVIRONMENT } from "@/constant";
import { COLORS, FONTS } from "@/theme";
import {
  checkIfLambdaResultIsSuccess,
  getLambdaErrorMessage,
  getAuthInfo,
  getProfilePhotoUri,
  storeAuthInfo,
  storeProfilePhotoUri,
} from "@/utils/helper";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as WebBrowser from "expo-web-browser";
import { useFocusEffect, useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
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
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_PROFILE_IMAGE = require("@/assets/images/home/meditation_icon.png");
const PENCIL_ICON = require("@/assets/images/profile/pencil.png");
const RED_ICON = require("@/assets/images/profile/red.png");
const YELLOW_ICON = require("@/assets/images/profile/yellow.png");
const BLUE_ICON = require("@/assets/images/profile/blue.png");
const CHANGE_FOCUS_ICON = require("@/assets/images/profile/change_focus_icon.png");
const MANAGE_SUBSCRIPTIONS_ICON = require("@/assets/images/profile/manage_subscriptions.png");
const SAVED_ICON = require("@/assets/images/profile/saved.png");
const REPORT_A_BUG_ICON = require("@/assets/images/profile/report_a_bug.png");
const SUGGEST_AN_IMPROVEMENT_ICON = require("@/assets/images/profile/suggest_an_improvement.png");
const CONTACT_US_ICON = require("@/assets/images/profile/contact_us.png");
const YOUTUBE_ICON = require("@/assets/images/profile/youtube.png");
const TIKTOK_ICON = require("@/assets/images/profile/tiktok.png");
const INSTAGRAM_ICON = require("@/assets/images/profile/instagram.png");
const MAX_PROFILE_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_FEEDBACK_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_PROFILE_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_PROFILE_PHOTO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

// Figma "Profile" frame 2875:9496 (Pro copy 37GSSpgSU44KPNvLuVKAOw), in pt.
const PROFILE_UI = {
  page: {
    background: "#FAFAFA",
    gutter: 23,
    topOffset: 41, // avatar top = status bar + 41
    maxContentWidth: 480,
    compactWidthBreakpoint: 390,
    maxFontSizeMultiplier: 1.2,
    sectionGap: 15,
    focusGap: 20, // divider ↔ focus block
  },
  header: {
    avatarSize: 120,
    avatarRingWidth: 1,
    avatarRingColor: COLORS.brandYellow,
    avatarFill: "#FBFAF6",
    nameTopGap: 23,
    nameFontSize: 24,
    nameLineHeight: 28,
    nameColor: "#000000",
    pencilWidth: 22,
    pencilHeight: 23,
    pencilGap: 5,
  },
  stats: {
    topGap: 28,
    cardGap: 9,
    cardMaxWidth: 110,
    cardMinHeight: 130,
    cardRadius: 20,
    cardBackground: "rgba(37, 37, 37, 0.4)",
    cardPaddingH: 12,
    cardPaddingV: 15,
    titleBoxMinHeight: 45, // 3 lines × 15
    titleFontSize: 14,
    titleLineHeight: 15,
    badgeSize: 40,
    valueFontSize: 36,
    valueLineHeight: 36,
    valueMinimumFontScale: 0.6,
    unitFontSize: 12,
    unitLineHeight: 14,
    textColor: "#FFFFFF",
  },
  statsCompact: {
    cardPaddingH: 10,
    badgeSize: 34,
  },
  focus: {
    iconSize: 44,
    titleGap: 9,
    titleFontSize: 20,
    titleLineHeight: 20,
    titleColor: "#000000",
    valueGap: 9,
    valueFontSize: 16,
    valueLineHeight: 20,
    valueColor: "#8F8F8F",
    valueMaxWidth: 265,
    buttonGap: 15,
    buttonMinWidth: 145,
    buttonMinHeight: 36,
    buttonPaddingH: 14,
    buttonBackground: "#595959",
    buttonFontSize: 13,
    buttonLineHeight: 22,
    buttonLetterSpacing: -0.408,
  },
  recent: {
    titleFontSize: 16,
    titleLineHeight: 28,
    titleLetterSpacing: 0.35,
    titleColor: "#000000",
    arrowSize: 24,
    arrowColor: "#595959",
    listGap: 4,
    cardGap: 20,
    emptyFontSize: 14,
    emptyLineHeight: 20,
    emptyColor: "#8B8B8B",
  },
  menu: {
    rowGap: 8,
    rowMinHeight: 44,
    rowRadius: 5,
    rowBackground: "#E5E5EA",
    rowPaddingH: 10,
    iconGap: 8,
    iconSize: 25,
    labelFontSize: 16,
    labelLineHeight: 20,
    labelColor: "#636366",
  },
  follow: {
    titleFontSize: 16,
    titleLineHeight: 28,
    titleLetterSpacing: 0.35,
    titleColor: "#636366",
    iconsGap: 12,
    iconGap: 19,
    iconRadius: 12,
  },
} as const;

type ProfileMenuItemId =
  | "saved"
  | "manage-subscriptions"
  | "report-bug"
  | "suggest-improvement"
  | "contact-us";

type AccountDetails = {
  average_meditation_time_in_mins: number | null;
  current_focus: string[] | string | null;
  email: string;
  name: string;
  number_of_days_active: number | null;
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
  number_of_days_active: 0,
  number_of_sessions_completed: 0,
  profile_pic: null,
  recently_accessed_sessions: [],
  total_meditation_time_in_mins: 0,
};

const DEFAULT_PROFILE_DETAILS_FORM: ProfileDetailsForm = {
  name: "",
  email: "",
  password: "",
};

const formatStatValue = (value: number | null | undefined) => `${value ?? 0}`;
const formatHoursFromMinutes = (value: number | null | undefined) => {
  if (!value) return "0";

  const totalHours = value / 60;
  return Number.isInteger(totalHours) ? `${totalHours}` : totalHours.toFixed(1);
};
const getAverageDailyMeditationMinutes = (
  totalMinutes: number | null | undefined,
  numberOfDaysActive: number | null | undefined,
) => {
  if (!totalMinutes || !numberOfDaysActive || numberOfDaysActive <= 0) {
    return 0;
  }

  return Math.floor(totalMinutes / numberOfDaysActive);
};
const normalizeCurrentFocus = (value: string[] | string | null | undefined): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value
      .split(/[•·,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const formatCurrentFocus = (value: string[] | string | null | undefined) => {
  const focusItems = normalizeCurrentFocus(value);
  return focusItems.length ? focusItems.join(" · ") : "No focus selected";
};

const Profile = () => {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isCompactWidth = windowWidth < PROFILE_UI.page.compactWidthBreakpoint;
  const stats = isCompactWidth ? { ...PROFILE_UI.stats, ...PROFILE_UI.statsCompact } : PROFILE_UI.stats;
  const {
    getAccountDetails: { getAccountDetails },
    getUserNameAndEmail: { getUserNameAndEmail },
    notifyCustomerFeedback: { notifyCustomerFeedback },
    submitFeedback: { submitFeedback },
    updateUserNameAndEmail: { updateUserNameAndEmail },
    uploadProfilePic: { uploadProfilePic },
  } = useUserApi();
  const [accountDetails, setAccountDetails] = React.useState<AccountDetails>(DEFAULT_ACCOUNT_DETAILS);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isProfileModalVisible, setIsProfileModalVisible] = React.useState(false);
  const [isProfileDetailsModalVisible, setIsProfileDetailsModalVisible] = React.useState(false);
  const [profileDetailsForm, setProfileDetailsForm] = React.useState<ProfileDetailsForm>(
    DEFAULT_PROFILE_DETAILS_FORM
  );
  const [profileDetailsError, setProfileDetailsError] = React.useState("");
  const [isFetchingProfileDetails, setIsFetchingProfileDetails] = React.useState(false);
  const [isUpdatingProfileDetails, setIsUpdatingProfileDetails] = React.useState(false);
  const [localProfilePhotoUri, setLocalProfilePhotoUri] = React.useState<string | null>(null);
  const [pendingProfilePhotoUri, setPendingProfilePhotoUri] = React.useState<string | null>(null);
  const [pendingProfilePhotoBase64, setPendingProfilePhotoBase64] = React.useState<string | null>(null);
  const [profilePhotoError, setProfilePhotoError] = React.useState("");
  const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = React.useState(false);
  const [activeFeedbackForm, setActiveFeedbackForm] = React.useState<
    "report-bug" | "suggest-improvement" | null
  >(null);
  const [feedbackImageUri, setFeedbackImageUri] = React.useState<string | null>(null);
  const [feedbackImageBase64, setFeedbackImageBase64] = React.useState<string | null>(null);
  const [feedbackError, setFeedbackError] = React.useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = React.useState(false);
  const [isContactFormVisible, setIsContactFormVisible] = React.useState(false);
  const [contactError, setContactError] = React.useState("");
  const [isSubmittingContact, setIsSubmittingContact] = React.useState(false);

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

  const resetFeedbackFormState = () => {
    setFeedbackImageUri(null);
    setFeedbackImageBase64(null);
    setFeedbackError("");
    setIsSubmittingFeedback(false);
  };

  const handleProfileDetailsPress = async () => {
    setProfileDetailsError("");
    setProfileDetailsForm({
      name: accountDetails.name,
      email: accountDetails.email,
      password: "",
    });
    setIsProfileDetailsModalVisible(true);
    setIsFetchingProfileDetails(true);

    try {
      const result = await getUserNameAndEmail();

      if (!checkIfLambdaResultIsSuccess(result) || !result.data) {
        setProfileDetailsError(getLambdaErrorMessage(result));
        return;
      }

      setProfileDetailsForm({
        name: result.data.name ?? "",
        email: result.data.email ?? "",
        password: "",
      });
    } catch (error) {
      console.error("Failed to fetch user name and email", error);
      setProfileDetailsError("Unable to load profile details right now.");
    } finally {
      setIsFetchingProfileDetails(false);
    }
  };

  const handleCloseProfileModal = () => {
    setProfilePhotoError("");
    setPendingProfilePhotoUri(null);
    setPendingProfilePhotoBase64(null);
    setIsProfileModalVisible(false);
  };

  const handleCloseProfileDetailsModal = () => {
    if (isUpdatingProfileDetails) {
      return;
    }

    setProfileDetailsError("");
    setIsProfileDetailsModalVisible(false);
  };

  const handleProfileDetailsFormChange = (field: keyof ProfileDetailsForm, value: string) => {
    setProfileDetailsForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleUpdateProfileDetailsPress = async () => {
    const name = profileDetailsForm.name.trim();
    const email = profileDetailsForm.email.trim();
    const password = profileDetailsForm.password;

    if (!name || !email) {
      setProfileDetailsError("Name or email is missing");
      return;
    }

    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      setProfileDetailsError("Email is not valid");
      return;
    }

    setProfileDetailsError("");
    setIsUpdatingProfileDetails(true);

    try {
      const result = await updateUserNameAndEmail({
        name,
        email,
        ...(password ? { password } : {}),
      });

      if (!checkIfLambdaResultIsSuccess(result) || !result.data) {
        setProfileDetailsError(getLambdaErrorMessage(result));
        return;
      }

      setAccountDetails((currentDetails) => ({
        ...currentDetails,
        name: result.data?.name ?? name,
        email: result.data?.email ?? email,
      }));

      const authInfo = await getAuthInfo();
      if (authInfo) {
        await storeAuthInfo({
          ...authInfo,
          userName: result.data.name,
        });
      }

      setProfileDetailsForm({
        name: result.data.name,
        email: result.data.email,
        password: "",
      });
      setIsProfileDetailsModalVisible(false);
    } catch (error) {
      console.error("Failed to update user name and email", error);
      setProfileDetailsError("Unable to update profile details right now. Please try again.");
    } finally {
      setIsUpdatingProfileDetails(false);
    }
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

  const handleChooseFeedbackImagePress = async () => {
    setFeedbackError("");

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        const message = "Photo library permission is required to attach an image.";
        setFeedbackError(message);
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
        setFeedbackError("Only JPG, PNG, and WEBP files are accepted.");
        return;
      }

      if ((selectedAsset.fileSize ?? 0) > MAX_FEEDBACK_IMAGE_SIZE_BYTES) {
        setFeedbackError("Image must not exceed 10MB.");
        return;
      }

      if (!selectedAsset.base64) {
        setFeedbackError("Unable to prepare this image for upload.");
        return;
      }

      setFeedbackImageUri(selectedAsset.uri);
      setFeedbackImageBase64(selectedAsset.base64);
    } catch (error) {
      console.error("Failed to pick feedback image", error);
      setFeedbackError("Unable to attach image right now. Please try again.");
    }
  };

  const handleRemoveFeedbackImagePress = () => {
    setFeedbackImageUri(null);
    setFeedbackImageBase64(null);
    setFeedbackError("");
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
    router.push({
      pathname: "/focus",
      params: { current_focus: JSON.stringify(normalizeCurrentFocus(accountDetails.current_focus)) },
    });
  };

  const handleSessionPress = (item: RecentlyAccessedSession) => {
    const isGenerated = item.is_generated === 1;

    router.push({
      pathname: "/meditation_session/player",
      params: {
        type: item.type,
        favourite: String(item.favourite ?? 0),
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

  const handleRecentlyPlayedPress = () => {
    router.push("/recently-played");
  };

  const handleProfileMenuItemPress = (itemId: ProfileMenuItemId) => {
    if (itemId === "saved") {
      router.push("/saved");
      return;
    }

    if (itemId === "report-bug" || itemId === "suggest-improvement") {
      resetFeedbackFormState();
      setActiveFeedbackForm(itemId);
      return;
    }

    if (itemId === "contact-us") {
      setContactError("");
      setIsSubmittingContact(false);
      setIsContactFormVisible(true);
      return;
    }

    // Functionality for these menu items will be wired up later.
  };

  const handleCloseFeedbackForm = () => {
    resetFeedbackFormState();
    setActiveFeedbackForm(null);
  };

  const handleSubmitFeedbackPress = async (message: string) => {
    if (!activeFeedbackForm) {
      return;
    }

    const description = message.trim();

    if (!description) {
      setFeedbackError("Description is missing");
      return;
    }

    if (description.length > 1000) {
      setFeedbackError("Description must be 1000 characters or fewer.");
      return;
    }

    setFeedbackError("");
    setIsSubmittingFeedback(true);

    try {
      const result = await submitFeedback({
        type: activeFeedbackForm === "report-bug" ? "bug" : "improvement",
        description,
        image_data: feedbackImageBase64,
      });

      if (!checkIfLambdaResultIsSuccess(result)) {
        setFeedbackError(getLambdaErrorMessage(result));
        return;
      }

      Alert.alert("Thank you", "Your feedback has been submitted.");
      handleCloseFeedbackForm();
    } catch (error) {
      console.error("Failed to submit feedback", error);
      setFeedbackError("Unable to submit feedback right now. Please try again.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleCloseContactForm = () => {
    setContactError("");
    setIsSubmittingContact(false);
    setIsContactFormVisible(false);
  };

  const handleSubmitContactPress = async (subject: string, message: string) => {
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setContactError("Message is missing");
      return;
    }

    if (trimmedMessage.length > 1000) {
      setContactError("Message must be 1000 characters or fewer.");
      return;
    }

    // The endpoint only accepts a message, so the optional subject is sent as its first line.
    const description = trimmedSubject
      ? `Subject: ${trimmedSubject}\n\n${trimmedMessage}`
      : trimmedMessage;

    setContactError("");
    setIsSubmittingContact(true);

    try {
      const result = await notifyCustomerFeedback({
        message: description,
      });

      if (!checkIfLambdaResultIsSuccess(result)) {
        setContactError(getLambdaErrorMessage(result));
        return;
      }

      Alert.alert("Thank you", "Your message has been sent.");
      handleCloseContactForm();
    } catch (error) {
      console.error("Failed to send customer feedback", error);
      setContactError("Unable to send your message right now. Please try again.");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleSocialButtonPress = async (url?: string) => {
    if (!url) return;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("Failed to open social link", error);
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
  const recentlyPlayedSessions = accountDetails.recently_accessed_sessions ?? [];
  const averageDailyMeditationMinutes = getAverageDailyMeditationMinutes(
    accountDetails.total_meditation_time_in_mins,
    accountDetails.number_of_days_active,
  );
  const menuItems: { id: ProfileMenuItemId; label: string; icon?: ImageSourcePropType }[] = [
    { id: "saved", label: "Saved",icon:SAVED_ICON},
    { id: "manage-subscriptions", label: "Manage subscriptions", icon: MANAGE_SUBSCRIPTIONS_ICON },
    { id: "report-bug", label: "Report a bug", icon: REPORT_A_BUG_ICON },
    { id: "suggest-improvement", label: "Suggest an improvement", icon: SUGGEST_AN_IMPROVEMENT_ICON },
    { id: "contact-us", label: "Contact us", icon: CONTACT_US_ICON },
  ];
  const socialItems: { label: string; icon: ImageSourcePropType; width: number; height: number; url?: string }[] = [
    { label: "YouTube", icon: YOUTUBE_ICON, width: 42, height: 42, url: "https://www.youtube.com/@OmMind-Official" },
    { label: "TikTok", icon: TIKTOK_ICON, width: 42, height: 42, url: "https://www.tiktok.com/@ommindapp" },
    { label: "Instagram", icon: INSTAGRAM_ICON, width: 40, height: 42, url: "https://www.instagram.com/ommind_meditation?vrfl=MW9rbnNjN2VtNmcwNQ==" },
  ];

  const feedbackFormContent = {
    "report-bug": {
      title: "Report a bug",
      titleVariant: "regular" as const,
      placeholder: "Describe the problem",
      attachmentHelperText: "You can attach a screenshot to help us better understand the problem",
    },
    "suggest-improvement": {
      title: "Suggest an improvement",
      titleVariant: "semibold" as const,
      placeholder: "Your suggestion",
      attachmentHelperText: "You can attach a screenshot to help us better understand the problem",
    },
  };

  if (activeFeedbackForm) {
    const formContent = feedbackFormContent[activeFeedbackForm];

    return (
      <ProfileFeedbackForm
        title={formContent.title}
        titleVariant={formContent.titleVariant}
        placeholder={formContent.placeholder}
        attachmentHelperText={formContent.attachmentHelperText}
        errorText={feedbackError}
        imagePreviewUri={feedbackImageUri}
        isSubmitting={isSubmittingFeedback}
        onBackPress={handleCloseFeedbackForm}
        onAddImagePress={handleChooseFeedbackImagePress}
        onRemoveImagePress={handleRemoveFeedbackImagePress}
        onSubmitPress={handleSubmitFeedbackPress}
      />
    );
  }

  if (isContactFormVisible) {
    return (
      <ProfileContactForm
        title="Contact us"
        responseTimeText="Our team will reply via email in 3 working days"
        emailAddress="ommind.contact@gmail.com"
        errorText={contactError}
        isSubmitting={isSubmittingContact}
        onBackPress={handleCloseContactForm}
        onSubmitPress={handleSubmitContactPress}
      />
    );
  }

  const statCards = [
    {
      title: "Average Meditation Time",
      value: formatStatValue(averageDailyMeditationMinutes),
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

  const maxFontSizeMultiplier = PROFILE_UI.page.maxFontSizeMultiplier;

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: insets.top + PROFILE_UI.page.topOffset,
            paddingBottom: tabBarHeight + 24,
          },
        ]}
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={[styles.loadingWrap, { top: insets.top + 8 }]}>
            <ActivityIndicator color="#B88A1A" size="large" />
          </View>
        ) : null}

        <View style={[styles.section, styles.headerSection]}>
          <TouchableOpacity
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            onPress={handleProfilePress}
          >
            <View style={styles.avatarRing}>
              <Image source={profileImageSource} style={styles.avatarImage} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Edit profile details"
            hitSlop={8}
            onPress={handleProfileDetailsPress}
            style={[styles.nameRow, { maxWidth: windowWidth - 2 * PROFILE_UI.page.gutter }]}
          >
            {/* Balances the pencil so the name itself is centred. */}
            <View style={styles.nameSpacer} />
            <Text
              style={styles.nameText}
              numberOfLines={1}
              ellipsizeMode="tail"
              maxFontSizeMultiplier={maxFontSizeMultiplier}
            >
              {accountDetails.name || "Profile"}
            </Text>
            <Image source={PENCIL_ICON} style={styles.pencilIcon} />
          </TouchableOpacity>

          {errorMessage ? (
            <Text style={styles.errorText} maxFontSizeMultiplier={maxFontSizeMultiplier}>
              {errorMessage}
            </Text>
          ) : null}
        </View>

        <View style={[styles.section, styles.statsRow]}>
          {statCards.map((card) => (
            <View
              key={card.title}
              accessible
              accessibilityLabel={`${card.title}, ${card.value} ${card.unit}`}
              style={[styles.statCard, { paddingHorizontal: stats.cardPaddingH }]}
            >
              <View style={styles.statTitleBox}>
                <Text style={styles.statTitle} numberOfLines={3} maxFontSizeMultiplier={maxFontSizeMultiplier}>
                  {card.title}
                </Text>
              </View>
              <View style={styles.statFooter}>
                <Image
                  source={card.icon}
                  accessible={false}
                  style={[styles.statBadgeImage, { width: stats.badgeSize, height: stats.badgeSize }]}
                />
                <View style={styles.statValueWrap}>
                  <Text
                    style={styles.statValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={stats.valueMinimumFontScale}
                    maxFontSizeMultiplier={maxFontSizeMultiplier}
                  >
                    {card.value}
                  </Text>
                  <Text style={styles.statUnit} maxFontSizeMultiplier={maxFontSizeMultiplier}>
                    {card.unit}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <GradientDivider style={styles.divider} />

        <View style={[styles.section, styles.focusSection]}>
          <Image source={CHANGE_FOCUS_ICON} accessible={false} style={styles.focusIcon} />

          <Text style={styles.focusTitle} maxFontSizeMultiplier={maxFontSizeMultiplier}>
            Your current focus
          </Text>
          <Text style={styles.focusValue} maxFontSizeMultiplier={maxFontSizeMultiplier}>
            {currentFocusText}
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            accessibilityRole="button"
            hitSlop={{ top: 4, bottom: 4 }}
            style={styles.changeFocusButton}
            onPress={handleChangeFocusPress}
          >
            <Text style={styles.changeFocusButtonText} maxFontSizeMultiplier={maxFontSizeMultiplier}>
              Change focus
            </Text>
          </TouchableOpacity>
        </View>

        <GradientDivider style={styles.dividerAfterFocus} />

        <View style={styles.recentlyPlayedSection}>
          <View style={styles.recentlyPlayedHeader}>
            <Text style={styles.recentlyPlayedTitle} maxFontSizeMultiplier={maxFontSizeMultiplier}>
              Recently Played
            </Text>
            <TouchableOpacity
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="View all recently played sessions"
              hitSlop={10}
              onPress={handleRecentlyPlayedPress}
            >
              <Feather
                name="arrow-right"
                size={PROFILE_UI.recent.arrowSize}
                color={PROFILE_UI.recent.arrowColor}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={recentlyPlayedSessions}
            keyExtractor={(item) => `${item.type}-${item.course_number}-${item.session_number}-${item.id}`}
            showsHorizontalScrollIndicator={false}
            style={styles.recentlyPlayedList}
            contentContainerStyle={styles.recentlyPlayedRow}
            renderItem={({ item }) => (
              <MeditationSessionCard
                variant="profile"
                session_length={item.session_length_in_mins ?? 0}
                session_title={item.session_title}
                image_url={item.image_url ?? undefined}
                session_progress={item.session_progress_in_secs}
                onPress={() => void handleSessionPress(item)}
                generated_meditation={item.is_generated}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.recentlyPlayedEmptyText} maxFontSizeMultiplier={maxFontSizeMultiplier}>
                No recently played sessions yet.
              </Text>
            }
          />
        </View>

        <GradientDivider style={styles.divider} />

        <View style={[styles.section, styles.profileMenuSection]}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              hitSlop={{ top: 2, bottom: 2 }}
              onPress={() => handleProfileMenuItemPress(item.id)}
              style={styles.profileMenuItem}
            >
              {item.icon ? <Image source={item.icon} style={styles.profileMenuIcon} /> : null}
              <Text style={styles.profileMenuText} numberOfLines={1} maxFontSizeMultiplier={maxFontSizeMultiplier}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <GradientDivider style={styles.divider} />

        <View style={[styles.section, styles.followSection]}>
          <Text style={styles.followTitle} maxFontSizeMultiplier={maxFontSizeMultiplier}>
            Follow OmMind
          </Text>
          <View style={styles.socialButtonRow}>
            {socialItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                hitSlop={4}
                onPress={() => handleSocialButtonPress(item.url)}
              >
                <Image
                  source={item.icon}
                  style={[styles.socialIcon, { width: item.width, height: item.height }]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {IS_DEVELOPMENT_ENVIRONMENT ? (
          <View style={styles.devTools}>
            <TestButtons />
          </View>
        ) : null}
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

      <ProfileDetailsModal
        visible={isProfileDetailsModalVisible}
        details={profileDetailsForm}
        errorText={profileDetailsError}
        isFetching={isFetchingProfileDetails}
        isSubmitting={isUpdatingProfileDetails}
        onClose={handleCloseProfileDetailsModal}
        onChange={handleProfileDetailsFormChange}
        onSubmit={handleUpdateProfileDetailsPress}
      />
    </>
  );
};

export default Profile;

const { page, header, stats: statsUi, focus, recent, menu, follow } = PROFILE_UI;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: page.background,
  },
  contentContainer: {
    flexGrow: 1,
  },
  loadingWrap: {
    position: "absolute",
    right: page.gutter,
    zIndex: 1,
  },
  // Every non-list section applies the gutter itself and stops growing on
  // wide screens (width 100% so alignSelf: center doesn't shrink-wrap it).
  section: {
    width: "100%",
    maxWidth: page.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: page.gutter,
  },
  divider: {
    marginTop: page.sectionGap,
    marginHorizontal: page.gutter,
  },
  dividerAfterFocus: {
    marginTop: page.focusGap,
    marginHorizontal: page.gutter,
  },
  headerSection: {
    alignItems: "center",
  },
  avatarRing: {
    width: header.avatarSize,
    height: header.avatarSize,
    borderRadius: header.avatarSize / 2,
    borderWidth: header.avatarRingWidth,
    borderColor: header.avatarRingColor,
    backgroundColor: header.avatarFill,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  nameRow: {
    marginTop: header.nameTopGap,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },
  nameSpacer: {
    width: header.pencilWidth + header.pencilGap,
  },
  nameText: {
    flexShrink: 1,
    fontFamily: FONTS.figtreeMedium500,
    fontSize: header.nameFontSize,
    lineHeight: header.nameLineHeight,
    color: header.nameColor,
    includeFontPadding: false,
  },
  pencilIcon: {
    width: header.pencilWidth,
    height: header.pencilHeight,
    marginLeft: header.pencilGap,
    resizeMode: "contain",
  },
  errorText: {
    marginTop: 6,
    textAlign: "center",
    fontFamily: FONTS.inter,
    fontSize: 13,
    lineHeight: 18,
    color: "#B73A45",
    includeFontPadding: false,
  },
  statsRow: {
    marginTop: statsUi.topGap,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: statsUi.cardGap,
  },
  statCard: {
    flex: 1,
    maxWidth: statsUi.cardMaxWidth,
    minHeight: statsUi.cardMinHeight,
    borderRadius: statsUi.cardRadius,
    backgroundColor: statsUi.cardBackground,
    paddingVertical: statsUi.cardPaddingV,
    justifyContent: "space-between",
  },
  statTitleBox: {
    minHeight: statsUi.titleBoxMinHeight,
    justifyContent: "center",
  },
  statTitle: {
    fontFamily: FONTS.afacadRegular,
    fontSize: statsUi.titleFontSize,
    lineHeight: statsUi.titleLineHeight,
    color: statsUi.textColor,
    textAlign: "left",
    includeFontPadding: false,
  },
  statFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statBadgeImage: {
    flexShrink: 0,
    resizeMode: "contain",
  },
  statValueWrap: {
    flexShrink: 1,
    alignItems: "flex-end",
    marginLeft: 4,
  },
  statValue: {
    fontFamily: FONTS.afacadBold,
    fontSize: statsUi.valueFontSize,
    lineHeight: statsUi.valueLineHeight,
    color: statsUi.textColor,
    textAlign: "right",
    includeFontPadding: false,
  },
  statUnit: {
    fontFamily: FONTS.afacadBold,
    fontSize: statsUi.unitFontSize,
    lineHeight: statsUi.unitLineHeight,
    color: statsUi.textColor,
    textAlign: "right",
    includeFontPadding: false,
  },
  focusSection: {
    marginTop: page.focusGap,
    alignItems: "center",
  },
  focusIcon: {
    width: focus.iconSize,
    height: focus.iconSize,
    resizeMode: "contain",
  },
  focusTitle: {
    marginTop: focus.titleGap,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: focus.titleFontSize,
    lineHeight: focus.titleLineHeight,
    color: focus.titleColor,
    textAlign: "center",
    includeFontPadding: false,
  },
  focusValue: {
    marginTop: focus.valueGap,
    maxWidth: focus.valueMaxWidth,
    fontFamily: FONTS.figtreeSemiBoldItalic,
    fontSize: focus.valueFontSize,
    lineHeight: focus.valueLineHeight,
    color: focus.valueColor,
    textAlign: "center",
    includeFontPadding: false,
  },
  changeFocusButton: {
    marginTop: focus.buttonGap,
    minWidth: focus.buttonMinWidth,
    minHeight: focus.buttonMinHeight,
    paddingHorizontal: focus.buttonPaddingH,
    borderRadius: focus.buttonMinHeight / 2,
    backgroundColor: focus.buttonBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  changeFocusButtonText: {
    fontFamily: FONTS.interSemiBold,
    fontSize: focus.buttonFontSize,
    lineHeight: focus.buttonLineHeight,
    letterSpacing: focus.buttonLetterSpacing,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
  recentlyPlayedSection: {
    marginTop: page.sectionGap,
  },
  recentlyPlayedHeader: {
    paddingHorizontal: page.gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recentlyPlayedTitle: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: recent.titleFontSize,
    lineHeight: recent.titleLineHeight,
    letterSpacing: recent.titleLetterSpacing,
    color: recent.titleColor,
    includeFontPadding: false,
  },
  recentlyPlayedList: {
    marginTop: recent.listGap,
  },
  // Gutter on the content (not the ScrollView) so the cards start at 23 but
  // scroll to the screen edge.
  recentlyPlayedRow: {
    paddingHorizontal: page.gutter,
    gap: recent.cardGap,
  },
  recentlyPlayedEmptyText: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: recent.emptyFontSize,
    lineHeight: recent.emptyLineHeight,
    color: recent.emptyColor,
    includeFontPadding: false,
  },
  profileMenuSection: {
    marginTop: page.sectionGap,
    gap: menu.rowGap,
  },
  profileMenuItem: {
    minHeight: menu.rowMinHeight,
    borderRadius: menu.rowRadius,
    backgroundColor: menu.rowBackground,
    paddingHorizontal: menu.rowPaddingH,
    flexDirection: "row",
    alignItems: "center",
    gap: menu.iconGap,
  },
  profileMenuIcon: {
    width: menu.iconSize,
    height: menu.iconSize,
    resizeMode: "contain",
  },
  profileMenuText: {
    flex: 1,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: menu.labelFontSize,
    lineHeight: menu.labelLineHeight,
    color: menu.labelColor,
    includeFontPadding: false,
  },
  followSection: {
    marginTop: page.sectionGap,
    alignItems: "center",
  },
  followTitle: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: follow.titleFontSize,
    lineHeight: follow.titleLineHeight,
    letterSpacing: follow.titleLetterSpacing,
    color: follow.titleColor,
    textAlign: "center",
    includeFontPadding: false,
  },
  socialButtonRow: {
    marginTop: follow.iconsGap,
    flexDirection: "row",
    justifyContent: "center",
    gap: follow.iconGap,
  },
  socialIcon: {
    borderRadius: follow.iconRadius,
    resizeMode: "contain",
  },
  devTools: {
    marginTop: 24,
    alignItems: "center",
  },
});


//mark session as completed - course_number, session_number
//update meditation time
