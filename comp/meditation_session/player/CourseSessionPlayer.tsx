import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
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
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { images } from "@/constants/images";
import BookmarkButtonWhite from "@/comp/buttons/BookmarkButtonWhite";
import { useMeditationAudio as useMeditationAudioService } from "@/api/meditation/useMeditationAudio";
import { useAppDispatch } from "@/store/hooks";
import {
  clearRecommendedSession,
  setHomePageTextFromSessionTitle,
} from "@/store/slices/HomePageInfoSlice";
import { patchMeditationCourseSession } from "@/store/slices/MeditationSlice";
import {
  addRecentlyAccessedSession,
  checkIfLambdaResultIsSuccess,
  updateSessionProgress,
} from "@/utils/helper";
import type { CourseSessionPlayerParams } from "./sessionPlayerParams";
import {
  BufferingBadge,
  PlayerBackground,
  TRACKER_SIZE,
  formatProgressPromptTime,
  formatTime,
  styles,
} from "./sessionPlayerShared";
import { usePlayerBackButton } from "./usePlayerBackButton";
import { useSessionFavourite } from "./useSessionFavourite";

const clampProgress = (value: number) => Math.max(0, Math.min(value, 1));

export default function CourseSessionPlayer({
  backgroundUrl,
  imageUrl,
  title,
  favourite,
  meditationType,
  courseUuid,
  courseNumber,
  sessionNumber,
  initialProgress,
  sessionTitlesParam,
  sessionMetadataParam,
  sessionTitles,
  sessionMetadata,
}: CourseSessionPlayerParams) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sessionNumbers = useMemo(
    () =>
      Object.keys(sessionTitles)
        .map(Number)
        .filter((value) => !Number.isNaN(value))
        .sort((a, b) => a - b),
    [sessionTitles]
  );
  const hasPlaylistNavigation = sessionNumbers.length > 0;
  const canSkipBackward =
    hasPlaylistNavigation && Boolean(sessionTitles[String(sessionNumber - 1)]);
  const canSkipForward =
    hasPlaylistNavigation && Boolean(sessionTitles[String(sessionNumber + 1)]);
  const sessionKey = `${meditationType ?? ""}-${courseNumber}-${sessionNumber}`;
  const hasInitialProgress = Number.isFinite(initialProgress) && initialProgress > 0;
  const initialProgressPromptTime = useMemo(
    () => formatProgressPromptTime(initialProgress),
    [initialProgress]
  );
  const { status, result, fetchMeditationAudioUrl } = useMeditationAudioService();
  const audioUrl = result?.data?.audio?.[0] ?? null;
  const bgmUrl = result?.data?.bgm?.[0] ?? null;
  const voicePlayer = useAudioPlayer(audioUrl, { updateInterval: 500 });
  const bgmPlayer = useAudioPlayer(bgmUrl, { updateInterval: 500 });
  const voiceStatus = useAudioPlayerStatus(voicePlayer);
  const bgmStatus = useAudioPlayerStatus(bgmPlayer);
  const { currentFavourite, isFavouriteUpdating, handleBookmarkPress } =
    useSessionFavourite({
      kind: "course",
      favourite,
      meditationType,
      courseUuid,
      courseNumber,
      sessionNumber,
    });
  const [progressTrackWidth, setProgressTrackWidth] = useState(0);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const [isPlaybackEnabled, setIsPlaybackEnabled] = useState(false);
  const [isBgmEnabled, setIsBgmEnabled] = useState(true);
  const [isResumePromptVisible, setIsResumePromptVisible] = useState(hasInitialProgress);
  const [isInitialPlaybackReady, setIsInitialPlaybackReady] = useState(!hasInitialProgress);
  const [pendingInitialStartSeconds, setPendingInitialStartSeconds] = useState<number | null>(
    null
  );
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
  const accumulatedPlaybackSecondsRef = useRef(0);
  const playbackStartedAtMsRef = useRef<number | null>(null);
  const isVoicePlayingRef = useRef(false);
  const progressMetadataRef = useRef({
    meditationType,
    courseUuid,
    courseNumber,
    sessionNumber,
  });

  useEffect(() => {
    if (!meditationType || Number.isNaN(courseNumber) || Number.isNaN(sessionNumber)) {
      console.error("meditationType or courseNumber or sessionNumber is missing ");
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
    accumulatedPlaybackSecondsRef.current = 0;
    playbackStartedAtMsRef.current = null;
  }, [hasInitialProgress, sessionKey]);

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
  }, [audioUrl, bgmPlayer, bgmUrl, voicePlayer]);

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

    if (
      !voiceStatus.isLoaded ||
      !bgmStatus.isLoaded ||
      voiceStatus.playing ||
      bgmStatus.playing
    ) {
      return;
    }

    hasAutoPlayedRef.current = true;
    bgmPlayer.play();
    voicePlayer.play();
  }, [
    audioUrl,
    bgmPlayer,
    bgmStatus.isLoaded,
    bgmStatus.playing,
    bgmUrl,
    isInitialPlaybackReady,
    voicePlayer,
    voiceStatus.isLoaded,
    voiceStatus.playing,
  ]);

  const getCurrentProgressSecond = useCallback((overrideSeconds?: number) => {
    const rawSeconds = overrideSeconds ?? currentTimeRef.current;
    const durationSeconds = durationRef.current;
    const clampedSeconds =
      durationSeconds > 0
        ? Math.min(Math.max(rawSeconds, 0), durationSeconds)
        : Math.max(rawSeconds, 0);

    return Math.floor(clampedSeconds);
  }, []);

  const flushAccumulatedPlaybackTime = useCallback(() => {
    const startedAtMs = playbackStartedAtMsRef.current;
    if (startedAtMs === null) {
      return;
    }

    const nowMs = Date.now();
    const elapsedMs = nowMs - startedAtMs;
    if (elapsedMs > 0) {
      accumulatedPlaybackSecondsRef.current += elapsedMs / 1000;
    }

    playbackStartedAtMsRef.current = isVoicePlayingRef.current ? nowMs : null;
  }, []);

  const saveSessionProgress = useCallback(
    async (overrideSeconds?: number, completed = false, source = "unknown") => {
      const {
        meditationType: currentMeditationType,
        courseUuid: currentCourseUuid,
        courseNumber: currentCourseNumber,
        sessionNumber: currentSessionNumber,
      } = progressMetadataRef.current;

      if (
        !currentMeditationType ||
        Number.isNaN(currentCourseNumber) ||
        Number.isNaN(currentSessionNumber)
      ) {
        if (__DEV__) {
          console.log("[SessionPlayer] skipping progress save; missing metadata", {
            source,
            currentMeditationType,
            currentCourseNumber,
            currentSessionNumber,
          });
        }
        return;
      }

      const progressSeconds = getCurrentProgressSecond(overrideSeconds);
      flushAccumulatedPlaybackTime();
      const accumulatedMinutes = Math.floor(accumulatedPlaybackSecondsRef.current / 60);
      const progressSaveKey = `${currentMeditationType}-${currentCourseNumber}-${currentSessionNumber}-${progressSeconds}`;
      if (
        !completed &&
        accumulatedMinutes <= 0 &&
        lastSavedProgressKeyRef.current === progressSaveKey
      ) {
        if (__DEV__) {
          console.log("[SessionPlayer] skipping duplicate progress save", {
            source,
            progressSeconds,
            accumulatedMinutes,
            completed,
          });
        }
        return;
      }

      lastSavedProgressKeyRef.current = progressSaveKey;

      try {
        if (__DEV__) {
          console.log("[SessionPlayer] progress save started", {
            source,
            progressSeconds,
            accumulatedMinutes,
            completed,
            type: currentMeditationType,
            courseNumber: currentCourseNumber,
            sessionNumber: currentSessionNumber,
          });
        }

        const result = await updateSessionProgress({
          type: currentMeditationType,
          course_number: currentCourseNumber,
          session_number: currentSessionNumber,
          accessed_type: currentMeditationType,
          progress: progressSeconds,
          accumulated_minutes: accumulatedMinutes,
          completed,
        });

        if (!checkIfLambdaResultIsSuccess(result)) {
          console.error("Failed to update session progress", result);
          lastSavedProgressKeyRef.current = null;
          return;
        }

        if (__DEV__) {
          console.log("[SessionPlayer] progress save finished", {
            source,
            progressSeconds,
            accumulatedMinutes,
            completed,
          });
        }

        if (completed || accumulatedMinutes > 0) {
          dispatch(clearRecommendedSession());
        }

        if (currentCourseUuid) {
          dispatch(
            patchMeditationCourseSession({
              uuid: currentCourseUuid,
              sessionNumber: currentSessionNumber,
              changes: completed
                ? { progress: progressSeconds, session_completed: 1 }
                : { progress: progressSeconds },
            })
          );
        }
      } catch (error) {
        console.error("Failed to update session progress", error);
        lastSavedProgressKeyRef.current = null;
      } finally {
        accumulatedPlaybackSecondsRef.current = 0;
      }
    },
    [dispatch, flushAccumulatedPlaybackTime, getCurrentProgressSecond]
  );

  const handleBackToExplore = useCallback(() => {
    if (__DEV__) {
      console.log(
        "[SessionPlayer] header back tapped; saving progress in background and navigating to explore",
        {
          route: "/explore",
          sessionKey,
        }
      );
    }

    isLeavingAfterSaveRef.current = true;
    void saveSessionProgress(undefined, false, "headerBack");
    router.dismissTo("/explore");
  }, [router, saveSessionProgress, sessionKey]);

  usePlayerBackButton(handleBackToExplore);

  useEffect(() => {
    if (voiceStatus.playing) {
      if (playbackStartedAtMsRef.current === null) {
        playbackStartedAtMsRef.current = Date.now();
      }
      return;
    }

    flushAccumulatedPlaybackTime();
  }, [flushAccumulatedPlaybackTime, voiceStatus.playing]);

  useEffect(() => {
    if (!voiceStatus.didJustFinish) {
      return;
    }

    if (
      !meditationType ||
      Number.isNaN(courseNumber) ||
      Number.isNaN(sessionNumber) ||
      isAdvancingSessionRef.current
    ) {
      return;
    }

    if (!hasPlaylistNavigation && !isPlaybackEnabled) {
      void saveSessionProgress(Math.ceil(durationRef.current || currentTimeRef.current), true);
      return;
    }

    const nextSessionNumber = isPlaybackEnabled ? sessionNumber : sessionNumber + 1;
    if (hasPlaylistNavigation && !sessionTitles[String(nextSessionNumber)]) {
      void saveSessionProgress(Math.ceil(durationRef.current || currentTimeRef.current), true);
      return;
    }

    isAdvancingSessionRef.current = true;
    void (async () => {
      await saveSessionProgress(Math.ceil(durationRef.current || currentTimeRef.current), true);
      voicePlayer.pause();
      bgmPlayer.pause();
      void bgmPlayer.seekTo(0);
      const nextSessionMetadata = sessionMetadata[String(nextSessionNumber)];
      router.replace({
        pathname: "/meditation_session/player",
        params: {
          title: sessionTitles[String(nextSessionNumber)] ?? title,
          favourite: String(nextSessionMetadata?.favourite ?? 0),
          message_id:
            nextSessionMetadata?.message_id == null
              ? ""
              : String(nextSessionMetadata.message_id),
          course_uuid: courseUuid ?? "",
          course_number: String(courseNumber),
          session_number: String(nextSessionNumber),
          session_titles: sessionTitlesParam ?? "",
          session_metadata: sessionMetadataParam ?? "",
          type: meditationType,
          image_url: imageUrl ?? "",
          backgroundUrl: backgroundUrl ?? "",
        },
      });
    })();
  }, [
    backgroundUrl,
    bgmPlayer,
    courseNumber,
    courseUuid,
    hasPlaylistNavigation,
    imageUrl,
    isPlaybackEnabled,
    meditationType,
    router,
    saveSessionProgress,
    sessionMetadata,
    sessionMetadataParam,
    sessionNumber,
    sessionTitles,
    sessionTitlesParam,
    title,
    voicePlayer,
    voiceStatus.didJustFinish,
  ]);

  const duration = voiceStatus.duration || 0;
  const currentTime = voiceStatus.currentTime || 0;

  useEffect(() => {
    if (
      !meditationType ||
      !title ||
      !imageUrl ||
      Number.isNaN(courseNumber) ||
      Number.isNaN(sessionNumber) ||
      !voiceStatus.isLoaded ||
      duration <= 0
    ) {
      return;
    }

    const currentSessionKey = `${meditationType}-${courseNumber}-${sessionNumber}`;
    if (recentlyAccessedSessionKeyRef.current === currentSessionKey) {
      return;
    }

    recentlyAccessedSessionKeyRef.current = currentSessionKey;

    const sessionLengthInMins = Math.ceil(duration / 60);
    void addRecentlyAccessedSession({
      course_number: courseNumber,
      session_number: sessionNumber,
      session_length_in_mins: sessionLengthInMins,
      is_generated: 0,
      type: meditationType,
      session_title: title,
      image_url: imageUrl,
      background_url: backgroundUrl ?? "",
    })
      .then((result) => {
        if (!checkIfLambdaResultIsSuccess(result)) {
          console.error("Failed to add recently accessed session", result);
          recentlyAccessedSessionKeyRef.current = null;
          return;
        }
        dispatch(setHomePageTextFromSessionTitle({ sessionTitle: title }));
        dispatch(clearRecommendedSession());
      })
      .catch((error) => {
        console.error("Failed to add recently accessed session", error);
        recentlyAccessedSessionKeyRef.current = null;
      });
  }, [
    backgroundUrl,
    courseNumber,
    dispatch,
    duration,
    imageUrl,
    meditationType,
    sessionNumber,
    title,
    voiceStatus.isLoaded,
  ]);

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const displayedProgress = dragProgress ?? progress;
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
  isVoicePlayingRef.current = voiceStatus.playing;
  progressMetadataRef.current = {
    meditationType,
    courseUuid,
    courseNumber,
    sessionNumber,
  };
  const progressPercentage = useMemo<DimensionValue>(
    () => `${displayedProgress * 100}%`,
    [displayedProgress]
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
      if (__DEV__) {
        console.log("[SessionPlayer] focused", {
          sessionKey,
          isGenerated: false,
        });
      }

      return () => {
        if (__DEV__) {
          console.log("[SessionPlayer] focus cleanup", {
            sessionKey,
            isLeavingAfterSave: isLeavingAfterSaveRef.current,
          });
        }

        if (isLeavingAfterSaveRef.current) {
          return;
        }

        void (async () => {
          await saveSessionProgress(undefined, false, "focusCleanup");
        })();
      };
    }, [saveSessionProgress, sessionKey])
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

    if (!hasPlaylistNavigation || !sessionTitles[String(nextSessionNumber)]) {
      return;
    }

    isAdvancingSessionRef.current = true;
    void saveSessionProgress();
    voicePlayer.pause();
    bgmPlayer.pause();
    const nextSessionMetadata = sessionMetadata[String(nextSessionNumber)];
    router.replace({
      pathname: "/meditation_session/player",
      params: {
        title: sessionTitles[String(nextSessionNumber)] ?? title,
        favourite: String(nextSessionMetadata?.favourite ?? 0),
        message_id:
          nextSessionMetadata?.message_id == null ? "" : String(nextSessionMetadata.message_id),
        course_uuid: courseUuid ?? "",
        course_number: String(courseNumber),
        session_number: String(nextSessionNumber),
        session_titles: sessionTitlesParam ?? "",
        session_metadata: sessionMetadataParam ?? "",
        type: meditationType,
        image_url: imageUrl ?? "",
        backgroundUrl: backgroundUrl ?? "",
      },
    });
  };

  const handleSkipBackward = () => {
    if (!canSkipBackward) {
      return;
    }

    void navigateToSession(sessionNumber - 1);
  };

  const handleSkipForward = () => {
    if (!canSkipForward) {
      return;
    }

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
            dragStartProgressRef.current + gestureState.dx / progressTrackWidthRef.current
          );
          setDragProgress(nextProgress);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (!durationRef.current || !progressTrackWidthRef.current) {
            setDragProgress(null);
            return;
          }

          const nextProgress = clampProgress(
            dragStartProgressRef.current + gestureState.dx / progressTrackWidthRef.current
          );
          setDragProgress(null);
          void seekToTime(nextProgress * durationRef.current);
        },
        onPanResponderTerminate: () => {
          setDragProgress(null);
        },
      }),
    [seekToTime]
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
    console.log("pressed play");
    console.log("starting to play");
    bgmPlayer.play();
    voicePlayer.play();
  };

  const handlePause = () => {
    voicePlayer.pause();
    bgmPlayer.pause();
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
    <PlayerBackground backgroundUrl={backgroundUrl}>
      <View style={styles.container}>
        <ImageBackground
          source={imageUrl ? { uri: imageUrl } : undefined}
          style={styles.image}
        />
        <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>

        <View style={{ flexDirection: "row", marginVertical: 5 }}>
          <Text style={styles.title}>{title}</Text>
          <BookmarkButtonWhite
            onTouch={handleBookmarkPress}
            isBookmarked={currentFavourite === 1}
            disabled={isFavouriteUpdating}
          />
        </View>

        {isWaitingForInitialAudio ? (
          <BufferingBadge isBusy text="Buffering audio..." />
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

        <View style={styles.iconRow}>
          <TouchableOpacity style={styles.iconButtonPreview} onPress={handleTogglePlayback}>
            <Image
              source={isPlaybackEnabled ? images.play_back_true : images.play_back_false}
              style={styles.iconPreviewImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButtonPreview} onPress={handleSkipBackward}>
            <Image
              source={images.skip_backwards}
              style={styles.iconPreviewImage}
              resizeMode="contain"
            />
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
            <Image
              source={images.skip_forwards}
              style={styles.iconPreviewImage}
              resizeMode="contain"
            />
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
    </PlayerBackground>
  );
}
