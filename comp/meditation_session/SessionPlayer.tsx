import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  DimensionValue,
  GestureResponderEvent,
  Image,
  ImageBackground,
  LayoutChangeEvent,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import {
  setAudioModeAsync,
  setIsAudioActiveAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { images } from "@/constants/images";
import { FONTS } from "@/theme";
import { useMeditationAudioService } from "@/services/useMeditationAudioService";
import BookmarkButtonWhite from "../buttons/BookmarkButtonWhite";
import {
  addRecentlyAccessedSession,
  checkIfLambdaResultIsSuccess,
  updateSessionProgress,
} from "@/utils/helper";

const SEEK_STEP_SECONDS = 10;
const TRACKER_SIZE = 24;



const formatTime = (timeInSeconds: number) => {
  const safeTime = Number.isFinite(timeInSeconds) ? Math.max(timeInSeconds, 0) : 0;
  const minutes = Math.floor(safeTime / 60);
  const seconds = Math.floor(safeTime % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const formatProgressPromptTime = (timeInSeconds: number) => {
  const safeTime = Number.isFinite(timeInSeconds) ? Math.max(Math.floor(timeInSeconds), 0) : 0;
  const minutes = Math.floor(safeTime / 60);
  const seconds = safeTime % 60;

  if (minutes <= 0) {
    return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
  }

  return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ${seconds} ${seconds === 1 ? "second" : "seconds"}`;
};


const getSingleParam = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const parseSessionTitles = (value?: string) => {
  if (!value) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(value);
    return typeof parsedValue === "object" && parsedValue !== null ? parsedValue as Record<string, string> : {};
  } catch {
    return {};
  }
};


const SessionPlayer = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    image_url?: string | string[];
    backgroundUrl?: string | string[];
    title?: string | string[];
    session_titles?: string | string[];
    type?: string | string[];
    course_number?: string | string[];
    session_number?: string | string[];
    progress?: string | string[];

  }>();
  const backgroundUrl = getSingleParam(params.backgroundUrl);
  const image_url = getSingleParam(params.image_url);
  const fallbackTitle = getSingleParam(params.title);
  const sessionTitlesParam = getSingleParam(params.session_titles);
  const meditationType = getSingleParam(params.type);
  const courseNumber = Number(getSingleParam(params.course_number));
  const sessionNumber = Number(getSingleParam(params.session_number));
  const initialProgress = Number(getSingleParam(params.progress) ?? 0);
  const sessionTitles = useMemo(() => parseSessionTitles(sessionTitlesParam), [sessionTitlesParam]);
  const title = sessionTitles[String(sessionNumber)] ?? fallbackTitle;
  const sessionNumbers = useMemo(
    () => Object.keys(sessionTitles).map(Number).filter((value) => !Number.isNaN(value)).sort((a, b) => a - b),
    [sessionTitles],
  );
  const sessionKey = `${meditationType ?? ""}-${courseNumber}-${sessionNumber}`;
  const hasInitialProgress = Number.isFinite(initialProgress) && initialProgress > 0;
  const initialProgressPromptTime = useMemo(
    () => formatProgressPromptTime(initialProgress),
    [initialProgress],
  );

  const { status, result, error, fetchMeditationAudioUrl } = useMeditationAudioService();
  const audioUrl = result?.data?.audio?.[0] ?? null;
  const bgmUrl = result?.data?.bgm?.[0] ?? null;
  const voicePlayer = useAudioPlayer(audioUrl, { updateInterval: 500 });
  const bgmPlayer = useAudioPlayer(bgmUrl, { updateInterval: 500 });
  const voiceStatus = useAudioPlayerStatus(voicePlayer);
  const bgmStatus = useAudioPlayerStatus(bgmPlayer);
  const [progressTrackWidth, setProgressTrackWidth] = useState(0);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const [isPlaybackEnabled, setIsPlaybackEnabled] = useState(false);
  const [isBgmEnabled, setIsBgmEnabled] = useState(true);
  const [isResumePromptVisible, setIsResumePromptVisible] = useState(hasInitialProgress);
  const [isInitialPlaybackReady, setIsInitialPlaybackReady] = useState(!hasInitialProgress);
  const [pendingInitialStartSeconds, setPendingInitialStartSeconds] = useState<number | null>(null);
  const dragStartProgressRef = useRef(0);
  const progressRef = useRef(0);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const progressTrackWidthRef = useRef(0);
  const voicePlayerRef = useRef(voicePlayer);
  const bgmPlayerRef = useRef(bgmPlayer);
  const isAdvancingSessionRef = useRef(false);
  const isLeavingAfterSaveRef = useRef(false);
  const hasAutoPlayedRef = useRef(false);
  const initialSeekKeyRef = useRef<string | null>(null);
  const lastSavedProgressKeyRef = useRef<string | null>(null);
  const recentlyAccessedSessionKeyRef = useRef<string | null>(null);
  const progressMetadataRef = useRef({
    meditationType,
    courseNumber,
    sessionNumber,
  });

  useEffect(() => {
    if (!meditationType || Number.isNaN(courseNumber) || Number.isNaN(sessionNumber)) {
        console.error("meditationType or courseNumber or sessionNumber is missing ")
      return;
    }

    void fetchMeditationAudioUrl({
      type: meditationType,
      course_number: courseNumber,
      session_number: sessionNumber,
    });
  }, [courseNumber, fetchMeditationAudioUrl, meditationType, sessionNumber]);

  useEffect(() => {
    setIsResumePromptVisible(hasInitialProgress);
    setIsInitialPlaybackReady(!hasInitialProgress);
    setPendingInitialStartSeconds(null);
    initialSeekKeyRef.current = null;
    hasAutoPlayedRef.current = false;
  }, [hasInitialProgress, sessionKey]);



  useEffect(() => {
    const configureAudio = async () => {
      await setIsAudioActiveAsync(true);
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: "mixWithOthers",
      });
    };

    void configureAudio();
  }, []);

  useEffect(() => {
    if (!audioUrl || !bgmUrl) {
      return;
    }

    console.log("audio urls ready", {
      audioUrl,
      bgmUrl,
    });
  }, [audioUrl, bgmUrl]);

  useEffect(() => {
    if (!audioUrl || !bgmUrl) {
      return;
    }

    voicePlayer.volume = 1;
    voicePlayer.loop = false;
    bgmPlayer.loop = true;
  }, [audioUrl, bgmUrl, bgmPlayer, voicePlayer]);

  useEffect(() => {
    bgmPlayer.volume = isBgmEnabled ? 0.2 : 0;
  }, [bgmPlayer, isBgmEnabled]);

  useEffect(() => {
    if (hasAutoPlayedRef.current || !audioUrl || !bgmUrl) {
      return;
    }

    if (!isInitialPlaybackReady) {
      return;
    }

    if (!voiceStatus.isLoaded || !bgmStatus.isLoaded || voiceStatus.playing || bgmStatus.playing) {
      return;
    }

    hasAutoPlayedRef.current = true;
    bgmPlayer.play();
    voicePlayer.play();
  }, [
    audioUrl,
    bgmStatus.isLoaded,
    bgmStatus.playing,
    bgmPlayer,
    isInitialPlaybackReady,
    voicePlayer,
    bgmUrl,
    voiceStatus.isLoaded,
    voiceStatus.playing,
  ]);

  useEffect(() => {
    console.log("voice status", {
      isLoaded: voiceStatus.isLoaded,
      playing: voiceStatus.playing,
      isBuffering: voiceStatus.isBuffering,
      duration: voiceStatus.duration,
      currentTime: voiceStatus.currentTime,
    });
  }, [
    voiceStatus.currentTime,
    voiceStatus.duration,
    voiceStatus.isBuffering,
    voiceStatus.isLoaded,
    voiceStatus.playing,
  ]);

  useEffect(() => {
    console.log("bgm status", {
      isLoaded: bgmStatus.isLoaded,
      playing: bgmStatus.playing,
      isBuffering: bgmStatus.isBuffering,
      duration: bgmStatus.duration,
      currentTime: bgmStatus.currentTime,
    });
  }, [
    bgmStatus.currentTime,
    bgmStatus.duration,
    bgmStatus.isBuffering,
    bgmStatus.isLoaded,
    bgmStatus.playing,
  ]);

  const getCurrentProgressSecond = useCallback((overrideSeconds?: number) => {
    const rawSeconds = overrideSeconds ?? currentTimeRef.current;
    const durationSeconds = durationRef.current;
    const clampedSeconds = durationSeconds > 0
      ? Math.min(Math.max(rawSeconds, 0), durationSeconds)
      : Math.max(rawSeconds, 0);

    return Math.floor(clampedSeconds);
  }, []);

  const saveSessionProgress = useCallback(async (overrideSeconds?: number) => {
    const {
      meditationType: currentMeditationType,
      courseNumber: currentCourseNumber,
      sessionNumber: currentSessionNumber,
    } = progressMetadataRef.current;

    if (
      !currentMeditationType ||
      Number.isNaN(currentCourseNumber) ||
      Number.isNaN(currentSessionNumber)
    ) {
      return;
    }

    const progressSeconds = getCurrentProgressSecond(overrideSeconds);
    const saveKey = `${currentMeditationType}-${currentCourseNumber}-${currentSessionNumber}-${progressSeconds}`;
    if (lastSavedProgressKeyRef.current === saveKey) {
      return;
    }

    lastSavedProgressKeyRef.current = saveKey;

    try {
      const result = await updateSessionProgress({
        course_number: currentCourseNumber,
        session_number: currentSessionNumber,
        type: currentMeditationType,
        progress: progressSeconds,
      });

      if (!checkIfLambdaResultIsSuccess(result)) {
        console.error("Failed to update session progress", result);
        lastSavedProgressKeyRef.current = null;
      }
    } catch (error) {
      console.error("Failed to update session progress", error);
      lastSavedProgressKeyRef.current = null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event: any) => {
      if (isAdvancingSessionRef.current || isLeavingAfterSaveRef.current) {
        return;
      }

      event.preventDefault();
      isLeavingAfterSaveRef.current = true;

      void (async () => {
        await saveSessionProgress();
        navigation.dispatch(event.data.action);
      })();
    });

    return unsubscribe;
  }, [navigation, saveSessionProgress]);

  useEffect(() => {
    if (!voiceStatus.didJustFinish) {
      return;
    }

    if (!meditationType || Number.isNaN(courseNumber) || Number.isNaN(sessionNumber) || isAdvancingSessionRef.current) {
      return;
    }

    const nextSessionNumber = isPlaybackEnabled ? sessionNumber : sessionNumber + 1;
    if (sessionNumbers.length > 0 && !sessionTitles[String(nextSessionNumber)]) {
      void saveSessionProgress(Math.ceil(durationRef.current || currentTimeRef.current));
      return;
    }

    isAdvancingSessionRef.current = true;
    void (async () => {
      await saveSessionProgress(Math.ceil(durationRef.current || currentTimeRef.current));
      voicePlayer.pause();
      bgmPlayer.pause();
      void bgmPlayer.seekTo(0);
      router.replace({
        pathname: "/meditation_session/player",
        params: {
          title: sessionTitles[String(nextSessionNumber)] ?? title,
          course_number: String(courseNumber),
          session_number: String(nextSessionNumber),
          session_titles: sessionTitlesParam ?? "",
          type: meditationType,
          image_url: image_url ?? "",
          backgroundUrl: backgroundUrl ?? "",
        },
      });
    })();
  }, [backgroundUrl, bgmPlayer, courseNumber, image_url, isPlaybackEnabled, meditationType, router, saveSessionProgress, sessionNumber, sessionNumbers.length, sessionTitles, sessionTitlesParam, title, voicePlayer, voiceStatus.didJustFinish]);

  const duration = voiceStatus.duration || 0;
  const currentTime = voiceStatus.currentTime || 0;

  useEffect(() => {
    if (
      !meditationType ||
      !title ||
      !image_url ||
      Number.isNaN(courseNumber) ||
      Number.isNaN(sessionNumber) ||
      !voiceStatus.isLoaded ||
      duration <= 0
    ) {
      return;
    }

    const sessionKey = `${meditationType}-${courseNumber}-${sessionNumber}`;
    if (recentlyAccessedSessionKeyRef.current === sessionKey) {
      return;
    }

    recentlyAccessedSessionKeyRef.current = sessionKey;

    const sessionLengthInMins = Math.ceil(duration / 60);
    void addRecentlyAccessedSession({
      course_number: courseNumber,
      session_number: sessionNumber,
      session_length_in_mins: sessionLengthInMins,
      is_generated: 0,
      type: meditationType,
      session_title: title,
      image_url,
      background_url: backgroundUrl ?? "",
    }).then((result) => {
      if (!checkIfLambdaResultIsSuccess(result)) {
        console.error("Failed to add recently accessed session", result);
        recentlyAccessedSessionKeyRef.current = null;
      }
    }).catch((error) => {
      console.error("Failed to add recently accessed session", error);
      recentlyAccessedSessionKeyRef.current = null;
    });
  }, [
    courseNumber,
    duration,
    backgroundUrl,
    image_url,
    meditationType,
    sessionNumber,
    title,
    voiceStatus.isLoaded,
  ]);

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const displayedProgress = dragProgress ?? progress;
  const clampProgress = (value: number) => Math.max(0, Math.min(value, 1));
  const isWaitingForInitialAudio =
    !voiceStatus.playing &&
    !bgmStatus.playing &&
    (status === "loading" ||
      !voiceStatus.isLoaded ||
      !bgmStatus.isLoaded ||
      voiceStatus.isBuffering ||
      bgmStatus.isBuffering);
  progressRef.current = progress;
  currentTimeRef.current = currentTime;
  durationRef.current = duration;
  progressTrackWidthRef.current = progressTrackWidth;
  voicePlayerRef.current = voicePlayer;
  bgmPlayerRef.current = bgmPlayer;
  progressMetadataRef.current = {
    meditationType,
    courseNumber,
    sessionNumber,
  };
  const progressPercentage = useMemo<DimensionValue>(
    () => `${displayedProgress * 100}%`,
    [displayedProgress],
  );
  const trackerOffset = useMemo(() => {
    if (!progressTrackWidth) {
      return -TRACKER_SIZE / 2;
    }

    return displayedProgress * progressTrackWidth - TRACKER_SIZE / 2;
  }, [displayedProgress, progressTrackWidth]);

  const seekToTime = useCallback(async (seconds: number) => {
    const clampedSeconds = Math.max(0, Math.min(seconds, durationRef.current || 0));

    await Promise.all([
      voicePlayerRef.current.seekTo(clampedSeconds),
      bgmPlayerRef.current.seekTo(clampedSeconds),
    ]);
  }, []);

  useEffect(() => {
    if (
      pendingInitialStartSeconds === null ||
      !voiceStatus.isLoaded ||
      !bgmStatus.isLoaded ||
      duration <= 0
    ) {
      return;
    }

    if (initialSeekKeyRef.current === sessionKey) {
      return;
    }

    initialSeekKeyRef.current = sessionKey;

    void (async () => {
      await seekToTime(pendingInitialStartSeconds);
      setPendingInitialStartSeconds(null);
      setIsInitialPlaybackReady(true);
    })();
  }, [
    bgmStatus.isLoaded,
    duration,
    pendingInitialStartSeconds,
    seekToTime,
    sessionKey,
    voiceStatus.isLoaded,
  ]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "inactive" || nextAppState === "background") {
        void saveSessionProgress();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [saveSessionProgress]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (isLeavingAfterSaveRef.current) {
          return;
        }

        void (async () => {
          await saveSessionProgress();
        })();
      };
    }, [saveSessionProgress]),
  );

  const navigateToSession = async (nextSessionNumber: number) => {
    if (
      !meditationType ||
      Number.isNaN(courseNumber) ||
      Number.isNaN(nextSessionNumber) ||
      nextSessionNumber < 1 ||
      isAdvancingSessionRef.current
    ) {
      return;
    }

    if (sessionNumbers.length > 0 && !sessionTitles[String(nextSessionNumber)]) {
      return;
    }

    isAdvancingSessionRef.current = true;
    await saveSessionProgress();
    voicePlayer.pause();
    bgmPlayer.pause();
    router.replace({
      pathname: "/meditation_session/player",
      params: {
        title: sessionTitles[String(nextSessionNumber)] ?? title,
        course_number: String(courseNumber),
        session_number: String(nextSessionNumber),
        session_titles: sessionTitlesParam ?? "",
        type: meditationType,
        image_url: image_url ?? "",
        backgroundUrl: backgroundUrl ?? "",
      },
    });
  };

  const handleSkipBackward = () => {
    void navigateToSession(sessionNumber - 1);
  };

  const handleSkipForward = () => {
    void navigateToSession(sessionNumber + 1);
  };

  const handleProgressPress = (event: GestureResponderEvent) => {
    if (!duration || !progressTrackWidth) {
      return;
    }

    const nextTime = (event.nativeEvent.locationX / progressTrackWidth) * duration;
    void seekToTime(nextTime);
  };

  const handleProgressLayout = (event: LayoutChangeEvent) => {
    setProgressTrackWidth(event.nativeEvent.layout.width);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          dragStartProgressRef.current = progressRef.current;
          setDragProgress(dragStartProgressRef.current);
        },
        onPanResponderMove: (_, gestureState) => {
          if (!progressTrackWidthRef.current) {
            return;
          }

          const nextProgress = clampProgress(
            dragStartProgressRef.current + gestureState.dx / progressTrackWidthRef.current,
          );
          setDragProgress(nextProgress);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (!durationRef.current || !progressTrackWidthRef.current) {
            setDragProgress(null);
            return;
          }

          const nextProgress = clampProgress(
            dragStartProgressRef.current + gestureState.dx / progressTrackWidthRef.current,
          );
          setDragProgress(null);
          void seekToTime(nextProgress * durationRef.current);
        },
        onPanResponderTerminate: () => {
          setDragProgress(null);
        },
      }),
    [seekToTime],
  );

  const handlePlay = () => {
    if (!isInitialPlaybackReady) {
      return;
    }

    if (!audioUrl || !bgmUrl) {
      console.log("play blocked: missing audio urls");
      return;
    }

    if (!voiceStatus.isLoaded || !bgmStatus.isLoaded) {
      console.log("play blocked: players not loaded yet", {
        voiceLoaded: voiceStatus.isLoaded,
        bgmLoaded: bgmStatus.isLoaded,
      });
      return;
    }
    console.log("pressed play")

    // if (bgmPlayer.paused && bgmPlayer.currentTime >= bgmPlayer.duration && bgmPlayer.duration > 0) {
    //   void bgmPlayer.seekTo(0);
    // }

    // if (voicePlayer.paused && voicePlayer.currentTime >= voicePlayer.duration && voicePlayer.duration > 0) {
    //   void voicePlayer.seekTo(0);
    // }
    console.log("starting to play")
    bgmPlayer.play();
    voicePlayer.play();
  };

  const handlePause = () => {
    voicePlayer.pause();
    bgmPlayer.pause();
  };

  const handleStop = () => {
    voicePlayer.pause();
    bgmPlayer.pause();
    void voicePlayer.seekTo(0);
    void bgmPlayer.seekTo(0);
  };

  const handleToggleBgm = () => {
    setIsBgmEnabled((currentValue) => !currentValue);
  };

  const handleTogglePlayback = () => {
    setIsPlaybackEnabled((currentValue) => !currentValue);
  };

  const handleResumeFromProgress = () => {
    setIsResumePromptVisible(false);
    setPendingInitialStartSeconds(initialProgress);
  };

  const handleStartFromBeginning = () => {
    setIsResumePromptVisible(false);
    setPendingInitialStartSeconds(0);
  };

  return (
    <ImageBackground
      source={backgroundUrl ? { uri: backgroundUrl } : undefined}
      style={styles.backgroundContainer}
    >
      <View style={styles.container}>

        <ImageBackground
          source={image_url ? { uri: image_url } : undefined}
          style={styles.image}
        />
          <Text
            style={styles.currentTime}
          >
            {formatTime(currentTime)}
          </Text>

          <View 
            style={{flexDirection:"row",marginVertical:5}}
          >

            <Text style={styles.title}>{title}</Text>
            <BookmarkButtonWhite onTouch={() => console.log("Bookmark pressed")} />
          </View>

          {isWaitingForInitialAudio ? (
            <View style={styles.bufferingBadge}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.bufferingText}>Buffering audio...</Text>
            </View>
          ) : null}

          <View style={styles.timeline}>
        <Pressable
          style={styles.progressTrack}
          onLayout={handleProgressLayout}
          onPress={handleProgressPress}
        >
          <View style={[styles.progressFill, { width: progressPercentage }]} />
          <View
            style={[
              styles.progressTrackerWrapper,
              { transform: [{ translateX: trackerOffset }] },
            ]}
            pointerEvents="box-none"
          >
            <View {...panResponder.panHandlers} style={styles.progressTrackerTouchArea}>
              <Image
                source={images.progress_tracker}
                style={styles.progressTracker}
                resizeMode="contain"
              />
            </View>
          </View>
        </Pressable>
         <View style={styles.timeRow}>
           <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
           <Text style={styles.timeText}>{formatTime(duration)}</Text>
         </View>
       </View>

       {/* icons  */}
       <View style={styles.iconRow}>
       <TouchableOpacity style={styles.iconButtonPreview} onPress={handleTogglePlayback}>
          <Image
            source={isPlaybackEnabled ? images.play_back_true : images.play_back_false}
            style={styles.iconPreviewImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButtonPreview} onPress={handleSkipBackward}>
          <Image source={images.skip_backwards} style={styles.iconPreviewImage} resizeMode="contain" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryIconButtonPreview}
          onPress={voiceStatus.playing ? handlePause : handlePlay}
        >
          <Image
            source={voiceStatus.playing ? images.pause_icon : images.play_icon}
            style={styles.primaryIconPreviewImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButtonPreview} onPress={handleSkipForward}>
          <Image source={images.skip_forwards} style={styles.iconPreviewImage} resizeMode="contain" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButtonPreview} onPress={handleToggleBgm}>
          <Image
            source={isBgmEnabled ? images.music_true : images.music_false}
            style={styles.iconPreviewImage}
            resizeMode="contain"
          />
        </TouchableOpacity>


       </View>
      </View>
      <Modal
        animationType="fade"
        transparent
        visible={isResumePromptVisible}
        onRequestClose={handleStartFromBeginning}
      >
        <View style={styles.resumeModalOverlay}>
          <View style={styles.resumeModalContent}>
            <Text style={styles.resumeModalTitle}>Continue your session?</Text>
            <Text style={styles.resumeModalText}>
              You were at {initialProgressPromptTime}. Would you like to continue from there?
            </Text>
            <View style={styles.resumeModalButtonRow}>
              <TouchableOpacity
                style={[styles.resumeModalButton, styles.resumeModalSecondaryButton]}
                onPress={handleStartFromBeginning}
              >
                <Text style={styles.resumeModalSecondaryButtonText}>Start over</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resumeModalButton, styles.resumeModalPrimaryButton]}
                onPress={handleResumeFromProgress}
              >
                <Text style={styles.resumeModalPrimaryButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

export default SessionPlayer;

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
  },
  container:{
    flex:1,
    alignItems:"center",
    paddingHorizontal:30,
  },
  currentTime:{
    fontFamily:FONTS.figtreeSemiBold,
    fontSize:40,
    color: "#FFFFFF",
  alignSelf: "flex-start",
  marginTop:40,
  },
  title: {
    flex: 1,
    marginRight: 12,
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 20,
    color: "#FFFFFF",
  },
  bufferingBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  bufferingText: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 13,
    color: "#FFFFFF",
  },
  image:{
  marginTop: 125,
  height: 300,
  width: 300,
  borderRadius: 25,
  overflow: "hidden",
  },
  timeline: {
    width: "95%",
    marginTop: 16,
    marginBottom: 8,
    // borderWidth:1,
  },
  progressTrack: {
    width: "100%",
    height: 7,
    borderRadius: 999,
    backgroundColor: "#A0A0A2",
    overflow: "visible",
    justifyContent: "center",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#8A8A8B",
  },
  progressTrackerWrapper: {
    position: "absolute",
    left: 0,
    top: "50%",
    marginTop: -TRACKER_SIZE / 2,
  },
  progressTrackerTouchArea: {
    width: TRACKER_SIZE,
    height: TRACKER_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTracker: {
    width: TRACKER_SIZE,
    height: TRACKER_SIZE,
  },
  timeRow: {
    width: "100%",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontFamily: FONTS.figtreeMedium,
    fontSize: 13,
    color: "#8E8E93",
  },
  iconRow: {
    // borderWidth:1,
    width: "100%",
    // marginTop: 24,
    flexDirection: "row",
    // flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems:"center",
    gap: 16,
  },
  iconButtonPreview: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryIconButtonPreview: {
    width: 44,
    height: 44,
  },
  iconPreviewImage: {
    width: 24,
    height: 24,
  },
  primaryIconPreviewImage: {
    width: 44,
    height: 44,
  },
  resumeModalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  resumeModalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 18,
    padding: 22,
    backgroundColor: "#FFFFFF",
  },
  resumeModalTitle: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 20,
    color: "#1C1C1E",
  },
  resumeModalText: {
    marginTop: 10,
    fontFamily: FONTS.figtreeMedium,
    fontSize: 15,
    lineHeight: 22,
    color: "#4A4A4D",
  },
  resumeModalButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
  },
  resumeModalButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  resumeModalPrimaryButton: {
    backgroundColor: "#1C1C1E",
  },
  resumeModalSecondaryButton: {
    backgroundColor: "#F0F0F2",
  },
  resumeModalPrimaryButtonText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 15,
    color: "#FFFFFF",
  },
  resumeModalSecondaryButtonText: {
    fontFamily: FONTS.figtreeSemiBold,
    fontSize: 15,
    color: "#1C1C1E",
  },
});
