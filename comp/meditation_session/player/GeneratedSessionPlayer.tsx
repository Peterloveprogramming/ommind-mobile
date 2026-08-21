import React, { useCallback, useEffect, useRef } from "react";
import { ImageBackground, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { images } from "@/constants/images";
import BookmarkButtonWhite from "@/comp/buttons/BookmarkButtonWhite";
import useChatMessageContentById from "@/api/chatMessages/useChatMessageContentById";
import { useWebsocketHexPcmAudio } from "@/services/useWebsocketHexPcmAudio";
import type { GeneratedSessionPlayerParams } from "./sessionPlayerParams";
import { BufferingBadge, PlayerBackground, styles } from "./sessionPlayerShared";
import { usePlayerBackButton } from "./usePlayerBackButton";
import { useSessionFavourite } from "./useSessionFavourite";

export default function GeneratedSessionPlayer({
  backgroundUrl,
  imageUrl,
  title,
  favourite,
  messageId,
}: GeneratedSessionPlayerParams) {
  const router = useRouter();
  const sessionKey = `generated-${messageId ?? "missing"}`;
  const {
    isLoading: isGeneratedContentLoading,
    error: generatedContentError,
    fetchChatMessageContent,
  } = useChatMessageContentById();
  const {
    playbackStatus: generatedPlaybackStatus,
    playAudio: playGeneratedAudio,
    dispose: disposeGeneratedAudio,
  } = useWebsocketHexPcmAudio();
  const { currentFavourite, isFavouriteUpdating, handleBookmarkPress } =
    useSessionFavourite({
      kind: "generated",
      favourite,
      messageId,
    });
  const fetchChatMessageContentRef = useRef(fetchChatMessageContent);
  const playGeneratedAudioRef = useRef(playGeneratedAudio);
  const disposeGeneratedAudioRef = useRef(disposeGeneratedAudio);

  useEffect(() => {
    fetchChatMessageContentRef.current = fetchChatMessageContent;
  }, [fetchChatMessageContent]);

  useEffect(() => {
    playGeneratedAudioRef.current = playGeneratedAudio;
  }, [playGeneratedAudio]);

  useEffect(() => {
    disposeGeneratedAudioRef.current = disposeGeneratedAudio;
  }, [disposeGeneratedAudio]);

  const handleBackToExplore = useCallback(() => {
    if (__DEV__) {
      console.log("[SessionPlayer] header back tapped; navigating generated session to explore", {
        route: "/explore",
        sessionKey,
      });
    }

    router.dismissTo("/explore");
  }, [router, sessionKey]);

  usePlayerBackButton(handleBackToExplore);

  useEffect(() => {
    let isCancelled = false;

    void (async () => {
      await disposeGeneratedAudioRef.current();

      if (!messageId) {
        console.error("message_id is missing for generated session playback");
        return;
      }

      const nextContent = await fetchChatMessageContentRef.current({ messageId });
      if (isCancelled || !nextContent) {
        return;
      }

      try {
        await playGeneratedAudioRef.current(nextContent);
      } catch (error) {
        console.error("Generated meditation playback failed:", error);
      }
    })();

    return () => {
      isCancelled = true;
      void disposeGeneratedAudioRef.current();
    };
  }, [messageId]);

  const isGeneratedPlaybackBusy =
    isGeneratedContentLoading || generatedPlaybackStatus === "buffering";
  const generatedStatusText = generatedContentError
    ? generatedContentError
    : !messageId
      ? "Generated meditation is missing its message id."
      : isGeneratedPlaybackBusy
        ? "Buffering audio..."
        : generatedPlaybackStatus === "paused"
          ? "Generated meditation paused"
          : generatedPlaybackStatus === "ended"
            ? "Generated meditation ended"
            : generatedPlaybackStatus === "playing"
              ? "Generated meditation playing"
              : "Preparing generated meditation...";

  return (
    <PlayerBackground backgroundUrl={backgroundUrl}>
      <View style={styles.container}>
        <ImageBackground
          source={imageUrl ? { uri: imageUrl } : images.meditation_test}
          style={styles.image}
        />

        <View style={{ flexDirection: "row", marginVertical: 15 }}>
          <Text style={styles.title}>{title ?? "Generated Guided Meditation"}</Text>
          <BookmarkButtonWhite
            onTouch={handleBookmarkPress}
            isBookmarked={currentFavourite === 1}
            disabled={isFavouriteUpdating}
          />
        </View>

        <BufferingBadge isBusy={isGeneratedPlaybackBusy} text={generatedStatusText} />
      </View>
    </PlayerBackground>
  );
}
