import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { useMeditationApi } from "@/api/meditation/requests";
import type {
  GetHomepageInfoInput,
  HomepageInfoData,
  RecommendedSession,
} from "@/api/meditation/types";
import {
  DEFAULT_AFFIRMATION,
  DEFAULT_HOME_PAGE_TEXT,
  DEFAULT_INTENTION,
  DEFAULT_MOOD,
} from "@/constant";
import {
  checkIfLambdaResultIsSuccess,
  deleteFromCache,
  deleteProfilePhotoUri,
  getLambdaErrorMessage,
  getAuthInfo,
  getProfilePhotoUri,
  generateUniqueId,
  navigateToNewChat,
  storeProfilePhotoUri,
} from "@/utils/helper";
import BaseButton from "@/comp/base/BaseButton";
import { FONTS } from "@/theme";
import ProfilePhotoUploadModal from "@/comp/modals/ProfilePhotoUploadModal";
import PersonalisedMeditationModal, { PersonalisedMeditationSelection } from "@/comp/modals/PersonalisedMeditationModal";
import MeditationSessionCard from "@/comp/meditation_session/MeditationSessionCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearHomePageInfo,
  getDailyAffirmationIntention,
  getDailyMood,
  getHomePageInfoState,
  setHomePageInfo,
} from "@/store/slices/HomePageInfoSlice";

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

const MOOD_OPTIONS = [
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

const isTimestampBeforeToday = (timestamp: number | null) => {
  if (!timestamp) return false;

  const timestampDate = new Date(timestamp);
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return timestampDate.getTime() < startOfToday.getTime();
};

const isCachedDailyMoodFresh = (timestamp: number | null) =>
  Boolean(timestamp && !isTimestampBeforeToday(timestamp));

const getInitialSelectedMood = (mood: string | null, lastFetchedAt: number | null) =>
  mood && isCachedDailyMoodFresh(lastFetchedAt) ? mood : DEFAULT_MOOD;

const hasFreshHomepageInfo = (lastFetchedAt: number | null) =>
  Boolean(lastFetchedAt && !isTimestampBeforeToday(lastFetchedAt));

type HomepageInfoLoadOptions = {
  queueAfterCurrent?: boolean;
  guidanceLoading?: boolean;
  recommendationLoading?: boolean;
};

const Home = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const cachedHomePageInfo = useAppSelector(getHomePageInfoState);
  const { mood: cachedDailyMood, lastFetchedAt: dailyMoodLastFetchedAt } =
    useAppSelector(getDailyMood);
  const {
    user_intention,
    user_affirmation,
  } = useAppSelector(getDailyAffirmationIntention);
  const cachedHomePageText = cachedHomePageInfo.homePageText.text;
  const cachedRecommendedSession = cachedHomePageInfo.recommendedSession.session;
  const [firstName, setFirstName] = useState("");
  const hasFreshCachedMood = Boolean(
    cachedDailyMood && isCachedDailyMoodFresh(dailyMoodLastFetchedAt)
  );
  const [selectedMood, setSelectedMood] = useState(
    getInitialSelectedMood(cachedDailyMood, dailyMoodLastFetchedAt)
  );
  const [homePageText, setHomePageText] = useState(
    cachedHomePageText || DEFAULT_HOME_PAGE_TEXT
  );
  const [intention, setIntention] = useState(user_intention || DEFAULT_INTENTION);
  const [affirmation, setAffirmation] = useState(user_affirmation || DEFAULT_AFFIRMATION);
  const [pendingMoodCheckIn, setPendingMoodCheckIn] = useState<string | null>(null);
  const [moodCheckInMessage, setMoodCheckInMessage] = useState("");
  const [hasMoodCheckedInToday, setHasMoodCheckedInToday] = useState(hasFreshCachedMood);
  const [isMoodCheckInLoading, setIsMoodCheckInLoading] = useState(false);
  const [isGuidanceLoading, setIsGuidanceLoading] = useState(false);
  const [recommendedSession, setRecommendedSession] = useState<RecommendedSession | null>(
    cachedRecommendedSession
  );
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(false);
  const [recommendationMessage, setRecommendationMessage] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [showMeditationModal, setShowMeditationModal] = useState(false);
  const [profileImageSource, setProfileImageSource] = useState<ImageSourcePropType>(MEDITATION_ICON);
  const [pendingProfilePhotoUri, setPendingProfilePhotoUri] = useState<string | null>(null);
  const [pendingProfilePhotoBase64, setPendingProfilePhotoBase64] = useState<string | null>(null);
  const [profilePhotoError, setProfilePhotoError] = useState("");
  const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isResettingMood, setIsResettingMood] = useState(false);
  const {
    getHomepageInfo,
    resetDailyMood,
  } = useMeditationApi();
  const getHomepageInfoRef = useRef(getHomepageInfo);
  const homePageInfoRef = useRef(cachedHomePageInfo);
  const intentionRequestIdRef = useRef(0);
  const homepageInfoRequestRef = useRef<Promise<unknown> | null>(null);
  const loadHomepageInfoRef = useRef<
    ((
      input?: GetHomepageInfoInput,
      options?: HomepageInfoLoadOptions
    ) => Promise<unknown>) | null
  >(null);
  const moodCheckInConfirmationRef = useRef(false);
  getHomepageInfoRef.current = getHomepageInfo;
  homePageInfoRef.current = cachedHomePageInfo;
  const {
    uploadProfilePic: { uploadProfilePic },
    getAccountDetails: { getAccountDetails },
  } = useUserApi();

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    setIntention(user_intention || DEFAULT_INTENTION);
    setAffirmation(user_affirmation || DEFAULT_AFFIRMATION);
  }, [user_affirmation, user_intention]);

  useEffect(() => {
    const loadUserName = async () => {
      const authInfo = await getAuthInfo();
      setFirstName(capitalizeName(getFirstName(authInfo?.userName)));
    };

    void loadUserName();
  }, []);

  const resetHomepageLocalState = () => {
    setSelectedMood(DEFAULT_MOOD);
    setHasMoodCheckedInToday(false);
    setIntention(DEFAULT_INTENTION);
    setAffirmation(DEFAULT_AFFIRMATION);
    setHomePageText(DEFAULT_HOME_PAGE_TEXT);
    setRecommendedSession(null);
    setRecommendationMessage("");
  };

  const applyHomepageInfoData = (data: HomepageInfoData | null) => {
    if (!data) {
      resetHomepageLocalState();
      return;
    }

    dispatch(setHomePageInfo(data));
    setHomePageText(data.home_page_text?.trim() || DEFAULT_HOME_PAGE_TEXT);

    const nextMood = data.mood_check_in?.mood?.trim() || "";
    setSelectedMood(nextMood || DEFAULT_MOOD);
    setHasMoodCheckedInToday(Boolean(nextMood));

    const nextIntention = data.intention_and_affirmation?.intention?.trim() || "";
    const nextAffirmation = data.intention_and_affirmation?.affirmation?.trim() || "";
    setIntention(nextIntention || DEFAULT_INTENTION);
    setAffirmation(nextAffirmation || DEFAULT_AFFIRMATION);
    setRecommendedSession(data.recommended_session);
    setRecommendationMessage("");
  };

  const applyCachedHomepageInfo = () => {
    const info = homePageInfoRef.current;
    setHomePageText(info.homePageText.text || DEFAULT_HOME_PAGE_TEXT);
    setSelectedMood(info.dailyMood.mood || DEFAULT_MOOD);
    setHasMoodCheckedInToday(Boolean(info.dailyMood.mood));
    setIntention(
      info.dailyAffirmationIntention.user_intention || DEFAULT_INTENTION
    );
    setAffirmation(
      info.dailyAffirmationIntention.user_affirmation || DEFAULT_AFFIRMATION
    );
    setRecommendedSession(info.recommendedSession.session);
    setRecommendationMessage("");
  };

  const isHomepageCacheComplete = () => {
    const info = homePageInfoRef.current;
    if (!hasFreshHomepageInfo(info.lastFetchedAt) || !info.homePageText.text) {
      return false;
    }

    if (!info.moodCheckIn.value) {
      return true;
    }

    return Boolean(
      info.dailyAffirmationIntention.user_intention &&
        info.dailyAffirmationIntention.user_affirmation &&
        info.recommendedSession.session
    );
  };

  const loadHomepageInfo = async (
    input: GetHomepageInfoInput = {},
    options: HomepageInfoLoadOptions = {}
  ) => {
    if (homepageInfoRequestRef.current) {
      if (!options.queueAfterCurrent) {
        return null;
      }
      await homepageInfoRequestRef.current.catch(() => null);
    }

    if (options.guidanceLoading) {
      setIsGuidanceLoading(true);
    }
    if (options.recommendationLoading) {
      setIsRecommendationLoading(true);
      setRecommendationMessage("");
    }

    const request = (async () => {
      const response = await getHomepageInfoRef.current(input);

      if (!checkIfLambdaResultIsSuccess(response) || !response.data) {
        const message = getLambdaErrorMessage(response);
        if (options.recommendationLoading) {
          setRecommendedSession(null);
          setRecommendationMessage(message);
        }
        return response;
      }

      applyHomepageInfoData(response.data);
      return response;
    })();

    homepageInfoRequestRef.current = request;

    try {
      return await request;
    } catch (error) {
      console.error("Failed to load homepage info", error);
      if (options.recommendationLoading) {
        setRecommendedSession(null);
        setRecommendationMessage("Unable to load your homepage info right now.");
      }
      throw error;
    } finally {
      if (homepageInfoRequestRef.current === request) {
        homepageInfoRequestRef.current = null;
      }
      if (options.guidanceLoading) {
        setIsGuidanceLoading(false);
      }
      if (options.recommendationLoading) {
        setIsRecommendationLoading(false);
      }
    }
  };
  loadHomepageInfoRef.current = loadHomepageInfo;

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const syncCachedHomepageInfo = () => {
        const cachedInfo = homePageInfoRef.current;
        const storedMoodFetchedAt = cachedInfo.dailyMood.lastFetchedAt;

        if (
          (storedMoodFetchedAt && !isCachedDailyMoodFresh(storedMoodFetchedAt)) ||
          (cachedInfo.lastFetchedAt && !hasFreshHomepageInfo(cachedInfo.lastFetchedAt))
        ) {
          dispatch(clearHomePageInfo());
          if (isActive) {
            resetHomepageLocalState();
          }
          return false;
        }

        if (!isHomepageCacheComplete()) {
          return false;
        }

        if (isActive) {
          applyCachedHomepageInfo();
        }
        return true;
      };

      const loadStoredProfilePhoto = async () => {
        const storedUri = await getProfilePhotoUri();
        if (isActive) {
          setProfileImageSource(storedUri ? { uri: storedUri } : MEDITATION_ICON);
        }
      };

      const didUseCache = syncCachedHomepageInfo();
      void loadStoredProfilePhoto();
      if (!didUseCache) {
        void loadHomepageInfoRef.current?.({}, { recommendationLoading: true });
      }

      return () => {
        isActive = false;
      };
    }, [dispatch])
  );

  const resetIntentionAndAffirmation = () => {
    setIsGuidanceLoading(false);
    setIntention(DEFAULT_INTENTION);
    setAffirmation(DEFAULT_AFFIRMATION);
    setRecommendedSession(null);
    setRecommendationMessage("");
  };

  const loadIntentionAndAffirmation = async (
    mood?: string,
    options: { forceRefresh?: boolean } = {}
  ) => {
    const normalizedMood = mood?.trim() ?? "";

    if (
      !options.forceRefresh &&
      normalizedMood &&
      cachedDailyMood === normalizedMood &&
      isHomepageCacheComplete()
    ) {
      applyCachedHomepageInfo();
      return;
    }

    const requestId = intentionRequestIdRef.current + 1;
    intentionRequestIdRef.current = requestId;

    try {
      const response = await loadHomepageInfo(
        {
          mood: normalizedMood || undefined,
          force_intention_refresh: options.forceRefresh,
          force_recommendation_refresh: options.forceRefresh,
        },
        {
          queueAfterCurrent: true,
          guidanceLoading: true,
          recommendationLoading: true,
        }
      );

      if (requestId !== intentionRequestIdRef.current) {
        return;
      }

      if (response && !checkIfLambdaResultIsSuccess(response)) {
        resetIntentionAndAffirmation();
      }
    } catch (error) {
      console.error("Failed to load intention and affirmation", error);
      if (requestId === intentionRequestIdRef.current) {
        resetIntentionAndAffirmation();
      }
    }
  };

  const submitMoodCheckIn = async (mood: string) => {
    setIsMoodCheckInLoading(true);
    setPendingMoodCheckIn(mood);
    setMoodCheckInMessage(
      `Saving your ${mood.toLowerCase()} check-in. Please wait before choosing another mood.`
    );

    try {
      const response = await loadHomepageInfo(
        { mood },
        {
          queueAfterCurrent: true,
          guidanceLoading: true,
          recommendationLoading: true,
        }
      );

      if (!checkIfLambdaResultIsSuccess(response)) {
        const message = getLambdaErrorMessage(response);
        if (message.toLowerCase().includes("already checked in")) {
          setHasMoodCheckedInToday(true);
        }
        setMoodCheckInMessage(message);
        Alert.alert("Mood check-in", message);
        return;
      }

      setHasMoodCheckedInToday(true);
      setMoodCheckInMessage("Your mood check-in has been saved for today.");
    } catch (error) {
      console.error("Failed to save mood check-in", error);
      const message = "Unable to save your mood check-in right now. Please try again.";
      setMoodCheckInMessage(message);
      Alert.alert("Unable to check in", message);
    } finally {
      setIsMoodCheckInLoading(false);
      setPendingMoodCheckIn(null);
    }
  };

  const handleResetMoodPress = async () => {
    if (isResettingMood) {
      return;
    }

    setIsResettingMood(true);
    setMoodCheckInMessage("Resetting your mood check-in...");

    try {
      const response = await resetDailyMood();

      if (!checkIfLambdaResultIsSuccess(response)) {
        const message = getLambdaErrorMessage(response);
        setMoodCheckInMessage(message);
        Alert.alert("Reset mood", message);
        return;
      }

      intentionRequestIdRef.current += 1;
      dispatch(clearHomePageInfo());
      setSelectedMood(DEFAULT_MOOD);
      setPendingMoodCheckIn(null);
      setHasMoodCheckedInToday(false);
      setIsGuidanceLoading(false);
      setIsRecommendationLoading(false);
      setIntention(DEFAULT_INTENTION);
      setAffirmation(DEFAULT_AFFIRMATION);
      setRecommendedSession(null);
      setRecommendationMessage("");
      setMoodCheckInMessage("Mood check-in reset.");
    } catch (error) {
      console.error("Failed to reset daily mood", error);
      const message = "Unable to reset your mood check-in right now.";
      setMoodCheckInMessage(message);
      Alert.alert("Reset mood", message);
    } finally {
      setIsResettingMood(false);
    }
  };

  const handleMoodPress = (mood: string) => {
    if (isMoodCheckInLoading) {
      setMoodCheckInMessage(
        "Your mood check-in is saving. Please wait before choosing another mood."
      );
      return;
    }

    if (hasMoodCheckedInToday) {
      setMoodCheckInMessage(
        "Your mood check-in is set for today. You can check in again tomorrow."
      );
      return;
    }

    if (moodCheckInConfirmationRef.current) {
      return;
    }

    moodCheckInConfirmationRef.current = true;
    Alert.alert(
      "Confirm mood check-in",
      `Would you like to check in as ${mood} for today?`,
      [
        {
          text: "Not now",
          style: "cancel",
          onPress: () => {
            moodCheckInConfirmationRef.current = false;
          },
        },
        {
          text: "Confirm",
          onPress: () => {
            moodCheckInConfirmationRef.current = false;
            void submitMoodCheckIn(mood);
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {
          moodCheckInConfirmationRef.current = false;
        },
      }
    );
  };

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

    setShowMeditationModal(true);
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

  const handlePersonalisedMeditationBegin = (
    selection: PersonalisedMeditationSelection
  ) => {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);
    setTimeout(() => {
      setIsNavigating(false);
    }, 1500);

    router.push({
      pathname: "/chat/new_index",
      params: {
        session_id: generateUniqueId(),
        guided_meditation_selection: JSON.stringify(selection),
      },
    });
  };

  const handleRefreshGuidancePress = () => {
    if (!selectedMood) {
      resetIntentionAndAffirmation();
      return;
    }

    void loadIntentionAndAffirmation(selectedMood, { forceRefresh: true });
  };

  const handleRecommendedSessionPress = () => {
    if (!recommendedSession || isNavigating) {
      return;
    }

    setIsNavigating(true);
    setTimeout(() => {
      setIsNavigating(false);
    }, 1500);

    const sessionTitle = `Session ${recommendedSession.session_number}: ${recommendedSession.title}`;

    router.push({
      pathname: "/meditation_session/player",
      params: {
        title: sessionTitle,
        favourite: String(recommendedSession.favourite ?? 0),
        course_number: String(recommendedSession.course_number),
        session_number: String(recommendedSession.session_number),
        type: recommendedSession.type,
        image_url: recommendedSession.imageUrl,
        backgroundUrl: recommendedSession.backgroundUrl,
        progress:
          recommendedSession.progress == null ? "" : String(recommendedSession.progress),
      },
    });
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
            dispatch(clearHomePageInfo());
            setProfileImageSource(MEDITATION_ICON);
            setPendingProfilePhotoUri(null);
            setPendingProfilePhotoBase64(null);
            setProfilePhotoError("");
            setIsProfileModalVisible(false);
            setRecommendedSession(null);
            setRecommendationMessage("");
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
  
  const moodCheckInStatusText = isMoodCheckInLoading
    ? `Saving your ${
        pendingMoodCheckIn?.toLowerCase() ?? "mood"
      } check-in. Please wait before choosing another mood.`
    : moodCheckInMessage;
  const recommendedSessions = recommendedSession ? [recommendedSession] : [];

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

        <View style={styles.tempActionsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogoutPress}
            style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
            disabled={isLoggingOut}
          >
            <Text style={styles.logoutButtonText}>Log out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleResetMoodPress}
            style={[styles.resetButton, isResettingMood && styles.logoutButtonDisabled]}
            disabled={isResettingMood}
          >
            <Text style={styles.resetButtonText}>reset</Text>
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
              <Text style={styles.messageText}>{homePageText}</Text>
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
          <Text style={styles.feelingsTitle}>🍃 How are you feeling today?</Text>
          <Text style={styles.feelingsSubtitle}>
            Choose what feels closest - this will be your check-in for today
          </Text>

          {moodCheckInStatusText ? (
            <View style={styles.moodCheckInStatusRow}>
              {isMoodCheckInLoading ? (
                <ActivityIndicator size="small" color="#7A756E" />
              ) : null}
              <Text style={styles.moodCheckInStatusText}>{moodCheckInStatusText}</Text>
            </View>
          ) : null}

          <View style={styles.feelingsGrid}>
            {MOOD_OPTIONS.map((feeling) => {
              const isSelectedMood = selectedMood === feeling.label;
              const isPendingMood = pendingMoodCheckIn === feeling.label;
              const shouldMuteMood =
                isMoodCheckInLoading && pendingMoodCheckIn !== feeling.label;

              return (
                <TouchableOpacity
                  key={feeling.label}
                  activeOpacity={0.85}
                  style={[
                    styles.feelingPill,
                    (isSelectedMood || isPendingMood) && styles.feelingPillSelected,
                    shouldMuteMood && styles.feelingPillMuted,
                  ]}
                  accessibilityState={{
                    busy: isPendingMood,
                    disabled: isMoodCheckInLoading || hasMoodCheckedInToday,
                    selected: isSelectedMood,
                  }}
                  onPress={() => handleMoodPress(feeling.label)}
                >
                  <Image source={feeling.icon} style={styles.feelingIcon} />
                  <Text
                    style={[
                      styles.feelingLabel,
                      (isSelectedMood || isPendingMood) && styles.feelingLabelSelected,
                    ]}
                  >
                    {feeling.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
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

            {isGuidanceLoading ? (
              <View style={styles.intentionLoadingWrap}>
                <ActivityIndicator size="small" color="#4B4748" />
              </View>
            ) : (
              <Text style={styles.intentionWord}>{intention}</Text>
            )}

            <View style={styles.intentionDivider} />

            <Text style={styles.affirmationLead}>Lhamo&apos;s Affirmation for you</Text>

            {isGuidanceLoading ? (
              <View style={styles.affirmationLoadingWrap}>
                <ActivityIndicator size="small" color="#4B4748" />
              </View>
            ) : (
              <Text style={styles.affirmationText}>{affirmation}</Text>
            )}

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

        <View style={styles.recommendationSection}>
          <View style={styles.recommendationHeader}>
            <Text style={styles.recommendationTitle}>Your Practice Today</Text>
            <TouchableOpacity
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Open today's practice"
              hitSlop={10}
              onPress={handleRecommendedSessionPress}
              disabled={!recommendedSession || isRecommendationLoading}
            >
              <Text style={styles.recommendationArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {isRecommendationLoading ? (
            <View style={styles.recommendationLoadingRow}>
              <ActivityIndicator size="small" color="#7A756E" />
              <Text style={styles.recommendationLoadingText}>Finding today&apos;s session...</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={recommendedSessions}
              keyExtractor={(item) => `${item.type}-${item.course_number}-${item.session_number}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendationRow}
              renderItem={({ item }) => (
                <MeditationSessionCard
                  session_length={item.durationMinutes}
                  session_title={`Session ${item.session_number}: ${item.title}`}
                  image_url={item.imageUrl || undefined}
                  session_progress={item.progress}
                  onPress={handleRecommendedSessionPress}
                  generated_meditation={0}
                />
              )}
              ListEmptyComponent={
                recommendationMessage ? (
                  <Text style={styles.recommendationMessage}>{recommendationMessage}</Text>
                ) : null
              }
            />
          )}
        </View>

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

      <PersonalisedMeditationModal
        visible={showMeditationModal}
        initialFocus={user_intention}
        showPersonaliseUsingConversation={false}
        onClose={() => setShowMeditationModal(false)}
        onBegin={handlePersonalisedMeditationBegin}
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
  tempActionsRow: {
    marginTop: 10,
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
  resetButton: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#C76767",
    backgroundColor: "#FFF8F8",
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: "#9E3F3F",
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
  moodCheckInStatusRow: {
    marginTop: 10,
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  moodCheckInStatusText: {
    flexShrink: 1,
    textAlign: "center",
    fontFamily: FONTS.inter,
    fontSize: 12,
    lineHeight: 17,
    color: "#7A756E",
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
  feelingPillMuted: {
    opacity: 0.55,
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
  intentionLoadingWrap: {
    marginTop: 6,
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
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
  affirmationLoadingWrap: {
    marginTop: 10,
    minHeight: 24,
    alignItems: "center",
    justifyContent: "center",
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
  recommendationSection: {
    marginTop: 18,
    paddingTop: 28,
    borderTopWidth: 1,
    borderTopColor: "#E7E0D7",
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recommendationTitle: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: "#111111",
  },
  recommendationArrow: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 28,
    lineHeight: 28,
    color: "#6D6965",
  },
  recommendationRow: {
    gap: 12,
    paddingTop: 16,
    paddingRight: 12,
  },
  recommendationLoadingRow: {
    paddingTop: 16,
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recommendationLoadingText: {
    fontFamily: FONTS.inter,
    fontSize: 14,
    lineHeight: 20,
    color: "#8B8B8B",
  },
  recommendationMessage: {
    fontFamily: FONTS.inter,
    fontSize: 14,
    lineHeight: 20,
    color: "#8B8B8B",
  },
});
