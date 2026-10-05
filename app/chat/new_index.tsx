import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View, TextInput, Platform, TouchableOpacity, FlatList, Keyboard, TouchableWithoutFeedback, ActivityIndicator, Image, Animated, Easing, AppState } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Back from '@/assets/svg/header/Back'
import SendButton from '@/assets/svg/chat/SendButton'
import MicButton from '@/assets/svg/chat/MicButton'
import PrecautionButton from '@/assets/svg/chat/PrecautionButton'
import Ai from '@/comp/chat/Ai'
import Human from '@/comp/chat/Human'
import OpenChatHistoryButton from '@/comp/headers/OpenChatHistoryButton'
import PersonalisedMeditationModal, { PersonalisedMeditationSelection } from '@/comp/modals/PersonalisedMeditationModal'
import { Ionicons } from '@expo/vector-icons'
import { images } from '@/constants/images'
import useFetchAiMessage from '@/api/chatAi/useFetchAiMessage'
import { useToast } from '@/context/useToast'
import { useWebsocketHexPcmAudio } from "@/services/useWebsocketHexPcmAudio"
import { DREAM, GUIDED_MEDITATION } from "@/constant"
import { PlaybackStatus } from '@/services/hexPcmAudioPlayer'
import { useVoiceToText } from '@/services/useVoiceToText'
import useChatMessagesBySessionId from '@/api/chatMessages/useChatMessagesBySessionId'
import useMessageRating from '@/api/messageRating/useMessageRating'
import { ChatMessageItem } from '@/api/chatMessages/types'
import { ChatAiRequest } from '@/api/chatAi/types'
import { FeedBackPayload } from '@/comp/chat/FeedBackModal'
import {
  checkIfLambdaResultIsSuccess,
  generateClientMessageId,
  generateRequestId,
  getLambdaErrorMessage,
  updateFavourite,
} from '@/utils/helper'
import { addChatBreadcrumb, setChatSessionContext } from '@/utils/chatTelemetry'

const CHAT_LIST_BOTTOM_PADDING = 16;
const COMPOSER_MIN_BOTTOM_PADDING = 8;

type ChatMessage = {
  id?: number;
  role: "human" | "ai";
  chatMessage?: ChatMessageItem | null;
  status?: "loading" | "ready";
  mode?: string | null;
  showPlayBackControl?: boolean;
  isPlaybackPaused?: boolean;
  showRating?: boolean;
  isFavourite?: boolean;
  // Correlates a human message / "loading" placeholder to the AI response
  // that answers it, so reconciliation doesn't have to assume the placeholder
  // is always the last item in the array (see useFetchAiMessage's aiRequestId).
  requestId?: string | null;
};

const getGeneratedMeditationMessageId = (message?: ChatMessageItem | null) =>
  message?.message_id ?? message?.id;

const normalizeMessageId = (messageId?: string | number | null) =>
  messageId == null ? null : String(messageId);

const buildHumanChatMessage = (
  content: string,
  sessionId: string,
  requestId: string | null,
  mode: string | null = null
): ChatMessage => ({
  role: "human",
  chatMessage: {
    id: generateClientMessageId(),
    session_id: sessionId,
    user_id: 0,
    content,
    role: "human",
    model: null,
    classification: null,
    workflow_executed: mode,
    needs_stage: null,
    needs_categorization_reasoning: null,
    needs_categorization_confidence: null,
    rating: null,
    archived: false,
    created_at: null,
    updated_at: null,
    deleted_at: null,
  },
  status: "ready",
  mode,
  requestId,
});

const getSingleParam = (param?: string | string[]) =>
  Array.isArray(param) ? param[0] : param;

const getGuidedMeditationLengthInMinutes = (length: string) => {
  const parsedLength = Number.parseInt(length, 10);
  return Number.isFinite(parsedLength) && parsedLength > 0 ? parsedLength : 5;
};

const parseGuidedMeditationSelectionParam = (
  param?: string
): PersonalisedMeditationSelection | null => {
  if (!param) {
    return null;
  }

  try {
    const parsedSelection = JSON.parse(param) as Partial<PersonalisedMeditationSelection>;
    if (
      typeof parsedSelection.focus !== "string" ||
      typeof parsedSelection.length !== "string" ||
      typeof parsedSelection.style !== "string"
    ) {
      return null;
    }

    return {
      focus: parsedSelection.focus,
      length: parsedSelection.length,
      style: parsedSelection.style,
      personaliseUsingConversation: Boolean(parsedSelection.personaliseUsingConversation),
    };
  } catch (error) {
    console.error("Failed to parse guided meditation selection", error);
    return null;
  }
};

type DreamAnalysisLaunchPayload = {
  dreamLogId?: string | number | null;
  dreamJournal: string;
};

const DREAM_ANALYSIS_PREFIX = "Analyze the dream journal below";

const isDreamAnalysisDisplayMessage = (content: string) =>
  content.trim().startsWith(DREAM_ANALYSIS_PREFIX);

const buildDreamAnalysisDisplayMessage = (dreamText: string) => {
  const trimmed = dreamText.trim();
  if (isDreamAnalysisDisplayMessage(trimmed)) {
    return trimmed;
  }

  return `${DREAM_ANALYSIS_PREFIX}\n\n---\n${trimmed}\n---`;
};

const parseDreamAnalysisPayloadParam = (
  param?: string
): DreamAnalysisLaunchPayload | null => {
  if (!param) {
    return null;
  }

  try {
    const parsedPayload = JSON.parse(param) as Partial<DreamAnalysisLaunchPayload>;
    if (
      typeof parsedPayload.dreamJournal !== "string" ||
      parsedPayload.dreamJournal.trim().length === 0
    ) {
      return null;
    }

    return {
      dreamLogId: parsedPayload.dreamLogId ?? null,
      dreamJournal: parsedPayload.dreamJournal,
    };
  } catch (error) {
    console.error("Failed to parse dream analysis payload", error);
    return null;
  }
};

const buildGuidedMeditationChatRequest = (
  selection: PersonalisedMeditationSelection
): ChatAiRequest => ({
  category: GUIDED_MEDITATION,
  workflowSpecificInput: {
    focus: selection.focus.trim() || "Calm the mind",
    meditation_style: selection.style,
    guided_meditation_length: getGuidedMeditationLengthInMinutes(selection.length),
    notes_from_user: selection.personaliseUsingConversation ? null : undefined,
  },
});

const SpiritualMentorChat = () => {
    const { session_id, existing_chat, guided_meditation_selection, dream_analysis_payload } = useLocalSearchParams<{
      session_id?: string | string[];
      existing_chat?: string | string[];
      guided_meditation_selection?: string | string[];
      dream_analysis_payload?: string | string[];
    }>()
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isMicPressed, setIsMicPressed] = useState(false);
    const [inputText, setInputText] = useState("");
    const [showMeditationModal, setShowMeditationModal] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [isGuidedMeditationGenerating, setIsGuidedMeditationGenerating] = useState(false);
    const normalizedSessionId = getSingleParam(session_id);
    const guidedMeditationSelectionParam = getSingleParam(guided_meditation_selection);
    const dreamAnalysisPayloadParam = getSingleParam(dream_analysis_payload);
    const isExistingChat = getSingleParam(existing_chat) === "true";
    const {showToastMessage} = useToast()
    const {aiMessage,isAiLoading,aiError,aiMode,aiRequestId,activeRequestId,fetchMessage,reset:resetAiMessageState,resumeActiveJob,wakePolling,pendingUserMessage} = useFetchAiMessage(false,normalizedSessionId ?? "");
    const { fetchChatMessages } = useChatMessagesBySessionId();
    const { submitMessageRating, isLoading: isMessageRatingLoading } = useMessageRating();
    const { playAudio, playbackStatus, pause, resume, dispose } = useWebsocketHexPcmAudio();
    const {
      isRecording,
      isConverting,
      startRecording,
      stopRecordingAndTranscribe,
    } = useVoiceToText({
      onTranscript: (transcript) => {
        setInputText((prevText) => {
          const normalizedTranscript = transcript.trim();
          if (!normalizedTranscript) return prevText;
          if (!prevText.trim()) return normalizedTranscript;
          return `${prevText} ${normalizedTranscript}`;
        });
      },
      onError: (error) => {
        console.error("Voice to text failed:", error);
        showToastMessage("Couldn’t catch that voice note. Please try again.", false);
      },
    });
    const [messages,setMessages] = useState<ChatMessage[]>([])
    const [updatingFavouriteMessageId, setUpdatingFavouriteMessageId] = useState<string | null>(null);
    const flatListRef = useRef<FlatList<ChatMessage> | null>(null);
    const fetchChatMessagesRef = useRef(fetchChatMessages);
    const resumeActiveJobRef = useRef(resumeActiveJob);
    const hasTriggeredInitialGuidedMeditationRef = useRef(false);
    const hasTriggeredInitialDreamAnalysisRef = useRef(false);
    // Closes the stale-closure double-send window: `isAiLoading` is only up
    // to date after the next render, but this ref is up to date immediately.
    const isSendingRef = useRef(false);
    const guidedMeditationSpinValue = useRef(new Animated.Value(0)).current;
    const composerBottomPadding = Math.max(insets.bottom, COMPOSER_MIN_BOTTOM_PADDING);
    const isGuidedMeditationInProgress =
      playbackStatus === "buffering" ||
      playbackStatus === "playing" ||
      playbackStatus === "paused";

    const scrollToLatestMessage = useCallback((delay = 100) => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, delay);
    }, []);

    useEffect(() => {
      if (!isGuidedMeditationGenerating) {
        guidedMeditationSpinValue.stopAnimation();
        guidedMeditationSpinValue.setValue(0);
        return;
      }

      const animation = Animated.loop(
        Animated.timing(guidedMeditationSpinValue, {
          toValue: 1,
          duration: 1100,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      animation.start();

      return () => {
        animation.stop();
      };
    }, [guidedMeditationSpinValue, isGuidedMeditationGenerating]);

    const guidedMeditationSpin = guidedMeditationSpinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

    const handleGuidedMeditationBegin = useCallback(
      (selection: PersonalisedMeditationSelection) => {
        if (!normalizedSessionId) {
          showToastMessage("session_id is not present", false);
          return;
        }

        if (isGuidedMeditationInProgress) {
          showToastMessage("Can not create meditation while guided meditation is in progress", false);
          return;
        }

        if (isAiLoading || isSendingRef.current) {
          return;
        }

        if (isConverting) {
          showToastMessage("Voice note is currently converting. Please wait a moment.", false);
          return;
        }

        Keyboard.dismiss();
        setIsGuidedMeditationGenerating(true);
        isSendingRef.current = true;
        void (async () => {
          try {
            await fetchMessage(buildGuidedMeditationChatRequest(selection), generateRequestId());
          } finally {
            setIsGuidedMeditationGenerating(false);
            isSendingRef.current = false;
          }
        })();
        scrollToLatestMessage(500);
      },
      [
        fetchMessage,
        isAiLoading,
        isConverting,
        isGuidedMeditationInProgress,
        normalizedSessionId,
        scrollToLatestMessage,
        showToastMessage,
      ]
    );

    useEffect(() => {
      if (!normalizedSessionId) {
        showToastMessage("session_id is not present", false);
      }
    }, [normalizedSessionId, showToastMessage]);

    useEffect(() => {
      fetchChatMessagesRef.current = fetchChatMessages;
    }, [fetchChatMessages]);

    useEffect(() => {
      resumeActiveJobRef.current = resumeActiveJob;
    }, [resumeActiveJob]);

    useEffect(() => {
      const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
      const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
      const showSubscription = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
      const hideSubscription = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }, []);

    useEffect(() => {
      if (
        hasTriggeredInitialGuidedMeditationRef.current ||
        isExistingChat ||
        !normalizedSessionId
      ) {
        return;
      }

      const selection = parseGuidedMeditationSelectionParam(guidedMeditationSelectionParam);
      if (!selection) {
        return;
      }

      hasTriggeredInitialGuidedMeditationRef.current = true;
      handleGuidedMeditationBegin(selection);
    }, [
      guidedMeditationSelectionParam,
      handleGuidedMeditationBegin,
      isExistingChat,
      normalizedSessionId,
    ]);
    useEffect(() => {
      let isCancelled = false;

      void dispose();
      // Cancel/discard any in-flight AI request from the previous session so
      // a late response can never bleed into the newly opened session.
      resetAiMessageState();
      isSendingRef.current = false;
      setMessages([]);
      setInputText("");
      setChatSessionContext(normalizedSessionId ?? null);
      addChatBreadcrumb("session_opened", { session_id: normalizedSessionId ?? null });

      if (!normalizedSessionId) {
        return () => {
          isCancelled = true;
        };
      }

      if (!isExistingChat) {
        // Ask the server whether a reply is still being generated for this session.
        void resumeActiveJobRef.current();
        return () => {
          isCancelled = true;
        };
      }

      void (async () => {
        const historyMessages = await fetchChatMessagesRef.current({
          sessionId: normalizedSessionId,
          offset: 0,
          limit: 50,
        });

        if (isCancelled) {
          return;
        }

        setMessages(
          historyMessages.map((message) => {
            const messageMode = message.workflow_executed ?? message.classification ?? null;
            const isDreamHumanMessage =
              message.role === "human" && message.workflow_executed === DREAM;

            return {
              id: message.id,
              role: message.role === "human" ? "human" : "ai",
              chatMessage:
                messageMode === GUIDED_MEDITATION && message.role === "ai"
                  ? { ...message, content: "Guided meditation ended" }
                  : isDreamHumanMessage
                    ? { ...message, content: buildDreamAnalysisDisplayMessage(message.content) }
                    : message,
              status: "ready",
              mode: messageMode,
              showPlayBackControl: false,
              isPlaybackPaused: true,
              showRating: false,
              isFavourite: message.favourite === 1,
            };
          })
        );

        // Asked after history loads so a resumed job's pending message and
        // spinner land after the existing messages.
        void resumeActiveJobRef.current();
      })();

      return () => {
        isCancelled = true;
      };
    }, [dispose, isExistingChat, normalizedSessionId, resetAiMessageState]);

    // Declared after the session-switch effect so its reset (clearing
    // messages and aborting in-flight requests) runs before this auto-send.
    useEffect(() => {
      if (
        hasTriggeredInitialDreamAnalysisRef.current ||
        isExistingChat ||
        !normalizedSessionId
      ) {
        return;
      }

      const payload = parseDreamAnalysisPayloadParam(dreamAnalysisPayloadParam);
      if (!payload) {
        return;
      }

      hasTriggeredInitialDreamAnalysisRef.current = true;
      isSendingRef.current = true;
      const requestId = generateRequestId();
      const newMessage: ChatMessage = {
        role: "human",
        chatMessage: {
          id: generateClientMessageId(),
          session_id: normalizedSessionId,
          user_id: 0,
          content: buildDreamAnalysisDisplayMessage(payload.dreamJournal),
          role: "human",
          model: null,
          classification: null,
          workflow_executed: DREAM,
          needs_stage: null,
          needs_categorization_reasoning: null,
          needs_categorization_confidence: null,
          rating: null,
          archived: false,
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
        status: "ready",
        mode: DREAM,
        requestId,
      };

      setMessages(prevMessages => [...prevMessages, newMessage]);
      void fetchMessage(
        {
          category: DREAM,
          user_message: payload.dreamJournal.trim(),
        },
        requestId
      ).finally(() => {
        isSendingRef.current = false;
      });
      scrollToLatestMessage(500);
    }, [
      dreamAnalysisPayloadParam,
      fetchMessage,
      isExistingChat,
      normalizedSessionId,
      scrollToLatestMessage,
    ]);

    const updateLatestGuidedMeditationMessage = useCallback((status: PlaybackStatus) => {
      setMessages(prevMessages => {
        const guidedMessageIndex = [...prevMessages]
          .reverse()
          .findIndex(message => message.mode === GUIDED_MEDITATION && message.showPlayBackControl);

        if (guidedMessageIndex === -1) {
          return prevMessages;
        }

        const actualIndex = prevMessages.length - 1 - guidedMessageIndex;
        return prevMessages.map((message, index) => {
          if (index !== actualIndex) {
            return message;
          }

          if (status === "ended") {
            return {
              ...message,
              chatMessage: message.chatMessage
                ? { ...message.chatMessage, content: "Guided meditation ended" }
                : message.chatMessage,
              showPlayBackControl: false,
              isPlaybackPaused: false,
            };
          }

          if (status === "paused") {
            return {
              ...message,
              chatMessage: message.chatMessage
                ? { ...message.chatMessage, content: "Guided meditation paused" }
                : message.chatMessage,
              isPlaybackPaused: true,
            };
          }

          if (status === "playing" || status === "buffering") {
            return {
              ...message,
              chatMessage: message.chatMessage
                ? { ...message.chatMessage, content: "Guided meditation playing" }
                : message.chatMessage,
              isPlaybackPaused: false,
            };
          }

          return message;
        });
      });
    }, []);

    const handleGuidedMeditationPlaybackPress = async () => {
      if (playbackStatus === "paused") {
        await resume();
        return;
      }

      if (playbackStatus === "playing" || playbackStatus === "buffering") {
        await pause();
      }
    };

    useEffect(() => {
      // Only run this logic if a new aiMessage has arrived
      if (aiMessage) {
        setMessages(prevMessages => {
          const isGuidedAiMessage = aiMode === GUIDED_MEDITATION;
          const nextAiMessage: ChatMessage =
            isGuidedAiMessage
              ? {
                  role: "ai",
                  chatMessage: {
                    ...aiMessage,
                    content: "Guided meditation playing",
                    workflow_executed: GUIDED_MEDITATION,
                  },
                  status: "ready",
                  mode: GUIDED_MEDITATION,
                  showPlayBackControl: true,
                  isPlaybackPaused: false,
                  showRating: true,
                  isFavourite: aiMessage.favourite === 1,
                  requestId: aiRequestId,
                }
              : {
                  role: "ai",
                  chatMessage: aiMessage,
                  status: "ready",
                  mode: aiMode,
                  showRating: true,
                  isFavourite: aiMessage.favourite === 1,
                  requestId: aiRequestId,
                };

          // Match the response to the placeholder that requested it, rather
          // than assuming it's always the last item in the array — the array
          // can have been reordered/appended to by another in-flight request.
          const matchIndex = aiRequestId
            ? prevMessages.findIndex(
                message => message.status === "loading" && message.requestId === aiRequestId
              )
            : -1;

          if (matchIndex !== -1) {
            addChatBreadcrumb("loading_placeholder_replaced", { request_id: aiRequestId });
            return prevMessages.map((message, index) =>
              index === matchIndex ? nextAiMessage : message
            );
          }

          // Fallback for responses without a requestId (e.g. the test-mode
          // fetch path): keep the previous positional behaviour.
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.status === "loading") {
            return [
              ...prevMessages.slice(0, -1),
              nextAiMessage
            ];
          }

          return [
            ...prevMessages,
            nextAiMessage
          ];
        });

        // Scroll to the end after the state update has been processed.
        // A shorter timeout is usually sufficient.
        scrollToLatestMessage();
      }
      if (aiMessage && aiMode === GUIDED_MEDITATION) {
        Keyboard.dismiss();
        (async () => {
          try {
            await playAudio(aiMessage.content);
          } catch (error) {
            console.error("Play audio failed:", error);
          }
        })();
      }
    }, [aiMessage, aiMode, aiRequestId, playAudio, scrollToLatestMessage]);

    useEffect(() => {
      if (playbackStatus === "idle") {
        return;
      }

      updateLatestGuidedMeditationMessage(playbackStatus);
    }, [playbackStatus, updateLatestGuidedMeditationMessage]);

    useEffect(() => {
      return () => {
        void dispose();
      };
    }, [dispose]);

    // Mirrors the audio cleanup above: if the screen unmounts entirely (e.g.
    // the user presses back) while a request is still in flight, abort it
    // instead of letting it resolve into a hook instance nobody reads
    // anymore. Session *switches* while staying mounted are already handled
    // by the resetAiMessageState() call in the session-switch effect above —
    // this only covers full unmount, which that effect doesn't run for.
    useEffect(() => {
      return () => {
        resetAiMessageState();
      };
    }, [resetAiMessageState]);

    useEffect(() => {
      if (!aiError) {
        return;
      }

      setMessages(prevMessages => {
        const matchIndex = aiRequestId
          ? prevMessages.findIndex(
              message => message.status === "loading" && message.requestId === aiRequestId
            )
          : -1;

        if (matchIndex !== -1) {
          addChatBreadcrumb("loading_placeholder_dropped_error", { request_id: aiRequestId });
          return prevMessages.filter((_, index) => index !== matchIndex);
        }

        const lastMessage = prevMessages[prevMessages.length - 1];
        if (!lastMessage || lastMessage.status !== "loading") {
          return prevMessages;
        }

        return prevMessages.slice(0, -1);
      });
    }, [aiError, aiRequestId]);

    // JS timers are paused in the background on iOS: on return, poll now if a
    // job is being polled, otherwise ask the server whether one is generating.
    useEffect(() => {
      if (!normalizedSessionId) {
        return;
      }
      const subscription = AppState.addEventListener("change", (nextState) => {
        if (nextState !== "active") {
          return;
        }
        if (!wakePolling()) {
          void resumeActiveJobRef.current();
        }
      });
      return () => {
        subscription.remove();
      };
    }, [normalizedSessionId, wakePolling]);

    // A resumed job's human message isn't in history until the reply is
    // saved, so show it optimistically above the loading placeholder.
    useEffect(() => {
      if (!pendingUserMessage || !activeRequestId) {
        return;
      }
      setMessages(prevMessages => {
        const alreadyShown = prevMessages.some(
          message => message.role === "human" && message.requestId === activeRequestId
        );
        if (alreadyShown) {
          return prevMessages;
        }
        return [
          ...prevMessages,
          buildHumanChatMessage(pendingUserMessage, normalizedSessionId ?? "", activeRequestId),
        ];
      });
      scrollToLatestMessage(500);
    }, [activeRequestId, normalizedSessionId, pendingUserMessage, scrollToLatestMessage]);


    useEffect(()=>{
      let loadingMessageTimeout: ReturnType<typeof setTimeout> | null = null;
      if (isAiLoading){
        console.log("ai is loading...")
        loadingMessageTimeout = setTimeout(() => {
          setMessages(prevMessages => [
            ...prevMessages,
            { id: generateClientMessageId(), role: "ai", status: "loading", requestId: activeRequestId },
          ]);
        }, 1000);
      }

      scrollToLatestMessage(2000);
      return () => {
        if (loadingMessageTimeout) {
          clearTimeout(loadingMessageTimeout);
        }
      };
    },[activeRequestId, isAiLoading, scrollToLatestMessage])

    const handleMicPressIn = async () => {
      setIsMicPressed(true);
      if (isGuidedMeditationInProgress || isAiLoading || isConverting) {
        return;
      }
      try {
        await startRecording();
      } catch (error) {
        console.error("Failed to start voice recording:", error);
        showToastMessage("Unable to start recording. Check microphone permission.", false);
      }
    };

    const handleMicPressOut = async () => {
      setIsMicPressed(false);
      if (!isRecording) {
        return;
      }
      try {
        await stopRecordingAndTranscribe();
      } catch (error) {
        console.error("Failed to transcribe recording:", error);
        showToastMessage("Voice recognition failed. Please try again.", false);
      }
    };


    const handleSend = () => {

    //checks
    if (inputText.trim().length === 0) {
      return;
    }
    if (isGuidedMeditationInProgress){
      showToastMessage("Can not send message while guided meditation is in progress", false);
      return;
    }
    if (isAiLoading || isSendingRef.current){
      return;
    }
    if (isConverting){
      showToastMessage("Voice note is currently converting. Please wait a moment.", false);
      return;
    }
    isSendingRef.current = true;
    const requestId = generateRequestId();
    const optimisticMessageId = generateClientMessageId();
    const newMessage: ChatMessage = {
      role: "human",
      chatMessage: {
        id: optimisticMessageId,
        session_id: normalizedSessionId ?? "",
        user_id: 0,
        content: inputText,
        role: "human",
        model: null,
        classification: null,
        workflow_executed: null,
        needs_stage: null,
        needs_categorization_reasoning: null,
        needs_categorization_confidence: null,
        rating: null,
        archived: false,
        created_at: null,
        updated_at: null,
        deleted_at: null,
      },
      status: "ready",
      requestId,
    };

    // 1. Update state
    setMessages(prevMessages => [...prevMessages, newMessage]);

    // 2. Call API (can happen concurrently with state update)
    void fetchMessage(inputText, requestId).finally(() => {
      isSendingRef.current = false;
    });

    // 3. Clear input
    setInputText('');

    // 4. Scroll to end (after state update has likely rendered)
    scrollToLatestMessage(500);
  };

  const handlePositiveRatingSelect = async ({
    rating,
    message_id,
    session_id: messageSessionId,
  }: {
    rating: number;
    message_id?: string | number;
    session_id?: string | number;
  }) => {
    if (rating <= 3 || !message_id || !messageSessionId || isMessageRatingLoading) {
      return false;
    }

    const response = await submitMessageRating({
      message_id,
      session_id: messageSessionId,
      rating,
      helpfulness: null,
      accuracy: null,
      clarity: null,
      tone: null,
      issues: null,
      other_details: null,
    });

    return Boolean(response);
  };

  const handleFeedbackSubmit = async ({
    overallRating,
    detailedRatings,
    selectedIssues,
    comment,
    message_id,
    session_id: messageSessionId,
  }: FeedBackPayload) => {
    if (!message_id || !messageSessionId || isMessageRatingLoading) {
      return false;
    }

    const response = await submitMessageRating({
      message_id,
      session_id: messageSessionId,
      rating: overallRating,
      helpfulness: detailedRatings.helpfulness,
      accuracy: detailedRatings.accuracy,
      clarity: detailedRatings.clarity,
      tone: detailedRatings.tone,
      issues: selectedIssues ? [selectedIssues] : null,
      other_details: comment || null,
    });

    return Boolean(response);
  };

  const handleFavouritePress = async (messageId?: string | number | null) => {
    const messageKey = normalizeMessageId(messageId);

    if (!messageKey || messageId == null) {
      showToastMessage("Unable to update favourite for this meditation.", false);
      return;
    }

    if (updatingFavouriteMessageId) {
      return;
    }

    const currentMessage = messages.find(
      (message) => normalizeMessageId(getGeneratedMeditationMessageId(message.chatMessage)) === messageKey
    );
    const nextFavourite: 0 | 1 = currentMessage?.isFavourite ? 0 : 1;

    setUpdatingFavouriteMessageId(messageKey);

    try {
      const result = await updateFavourite({
        type: "generated_meditation",
        message_id: messageId,
        favourite: nextFavourite,
      });

      if (!checkIfLambdaResultIsSuccess(result)) {
        showToastMessage(getLambdaErrorMessage(result), false);
        return;
      }

      setMessages((prevMessages) =>
        prevMessages.map((message) => {
          if (normalizeMessageId(getGeneratedMeditationMessageId(message.chatMessage)) !== messageKey) {
            return message;
          }

          return {
            ...message,
            isFavourite: nextFavourite === 1,
            chatMessage: message.chatMessage
              ? { ...message.chatMessage, favourite: nextFavourite }
              : message.chatMessage,
          };
        })
      );

      showToastMessage(
        nextFavourite === 1 ? "Added to favourites" : "Removed from favourites",
        true
      );
    } catch (error) {
      console.error("Failed to update generated meditation favourite", error);
      showToastMessage("Unable to update favourite.", false);
    } finally {
      setUpdatingFavouriteMessageId(null);
    }
  };

    return (
      <KeyboardAvoidingView
        style={styles.Parent}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Stack.Screen options={{ headerShown: false }} />

        <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Back />
          </TouchableOpacity>

          <View style={styles.lhamoPill}>
            <Image source={images.lhamo_mini} style={styles.lhamoIcon} resizeMode="contain" />
            <Text style={styles.lhamoText}>Lhamo</Text>
          </View>

          <OpenChatHistoryButton onTouch={() => router.push("/chat/history")} />
        </View>

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.chatViewParent}>
            <View style={styles.chatviewChild}>
              <View style={styles.precautionViewStyle}>
                <Text style={styles.precautionText}>Precautionary note</Text>
                <PrecautionButton />
              </View>

              <FlatList
                data={messages}
                ref={flatListRef}
                contentContainerStyle={styles.chatListContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                onContentSizeChange={() => scrollToLatestMessage(0)}
                keyExtractor={(item) => String(item.chatMessage?.id ?? item.id)}
                renderItem={({ item }) => {
                  if (item.status === "loading") {
                      return (
                        <Ai
                          message="loading"
                          showPlaybackControl={item.showPlayBackControl}
                          showPlayButton={item.isPlaybackPaused}
                          onPlaybackControlPress={handleGuidedMeditationPlaybackPress}
                          showRating={item.showRating}
                          message_id={item.chatMessage?.id}
                          session_id={item.chatMessage?.session_id}
                          isRatingLoading={isMessageRatingLoading}
                          onFeedbackSubmit={handleFeedbackSubmit}
                          onPositiveRatingSelect={handlePositiveRatingSelect}
                        />
                      );
                  }

                  if (!item.chatMessage) {
                    return null;
                  }

                  if (item.role === "ai") {
                      const favouriteMessageId = getGeneratedMeditationMessageId(item.chatMessage);
                      const favouriteMessageKey = normalizeMessageId(favouriteMessageId);

                      return (
                        <Ai
                          message={item.chatMessage.content}
                          showPlaybackControl={item.showPlayBackControl}
                          showPlayButton={item.isPlaybackPaused}
                          onPlaybackControlPress={handleGuidedMeditationPlaybackPress}
                          onFavouritePress={() => void handleFavouritePress(favouriteMessageId)}
                          isFavourite={item.isFavourite}
                          isFavouriteUpdating={updatingFavouriteMessageId === favouriteMessageKey}
                          showRating={item.showRating}
                          message_id={item.chatMessage.id}
                          session_id={item.chatMessage.session_id}
                          isRatingLoading={isMessageRatingLoading}
                          onFeedbackSubmit={handleFeedbackSubmit}
                          onPositiveRatingSelect={handlePositiveRatingSelect}
                        />
                      );
                  } else if (item.role === "human") {
                      return <Human message={item.chatMessage.content} />;
                  }
                    return null;
                }}
              />
            </View>
          </View>
          </TouchableWithoutFeedback>

          {!isKeyboardVisible && (
            <View style={styles.createMeditationRow}>
              {isGuidedMeditationGenerating ? (
                <View style={styles.guidedMeditationGeneratingPill}>
                  <Animated.Image
                    source={images.rinpoche_sparkle}
                    style={[
                      styles.createMeditationIcon,
                      { transform: [{ rotate: guidedMeditationSpin }] },
                    ]}
                  />
                  <Text style={styles.guidedMeditationGeneratingText}>
                    Guided meditation is being generated
                  </Text>
                  <ActivityIndicator size="small" color="#D89B4A" />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.createMeditationButton}
                  activeOpacity={0.85}
                  onPress={() => setShowMeditationModal(true)}
                >
                  <Image source={images.rinpoche_sparkle} style={styles.createMeditationIcon} />
                  <Text style={styles.createMeditationText}>Create My Meditation</Text>
                  <Ionicons name="chevron-forward" size={18} color="#D89B4A" />
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={[styles.inputView, { paddingBottom: composerBottomPadding }]}>
            <View style={styles.inputChild}>

              {/* message box  */}
              <TextInput
                style={styles.inputBox}
                placeholder="You can type here to reply..."
                placeholderTextColor="#999"
                value={inputText}
                multiline={true}
                onChange={(e) => setInputText(e.nativeEvent.text)}
                onFocus={() => scrollToLatestMessage()}
              />

              {/* mic button */}
              <TouchableOpacity
                onPressIn={() => {
                  void handleMicPressIn();
                }}
                onPressOut={() => {
                  void handleMicPressOut();
                }}
                activeOpacity={0.85}
                style={[
                  styles.micButtonContainer,
                  (isMicPressed || isRecording) && styles.micButtonPressed,
                  isConverting && styles.micButtonConverting,
                ]}
              >
                {isConverting ? (
                  <ActivityIndicator size="small" color="#F8C63E" />
                ) : (
                  <MicButton />
                )}
              </TouchableOpacity>
            </View>

            {/* send button */}
            <View style={styles.sendButtonStyle}>
              <TouchableOpacity onPress={handleSend}>
                <SendButton />
              </TouchableOpacity>
            </View>

          </View>

          <PersonalisedMeditationModal
            visible={showMeditationModal}
            onClose={() => setShowMeditationModal(false)}
            onBegin={handleGuidedMeditationBegin}
          />
      </KeyboardAvoidingView>
    )
}


export default SpiritualMentorChat

const styles = StyleSheet.create({
    Parent: {
        flex: 1,
        backgroundColor: "#FFFFFF",
      },
      headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 8,
      },
      lhamoPill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        width: 135,
        height: 40,
        borderRadius: 50,
        backgroundColor: 'rgba(71, 71, 71, 0.5)',
      },
      lhamoText: {
        color: '#FFFFFF',
      },
      lhamoIcon: {
        width: 24,
        height: 24,
      },
      chatViewParent:{
        flex: 1, // Let chat view take up remaining space
      },
      precautionViewStyle:{
        flexDirection:"row",
        gap:5,
        alignItems:"center",
        justifyContent:"center",
        padding:5,
      },
      precautionText:{
        color: 'rgba(71, 71, 71, 0.5)',
      },
      chatviewChild :{
        flex:1,
        paddingVertical:10,
        paddingHorizontal: 10,
      },
      chatListContent: {
        paddingBottom: CHAT_LIST_BOTTOM_PADDING,
      },
      createMeditationRow: {
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 8,
      },
      createMeditationButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        alignSelf: "center",
        backgroundColor: "#F7F2E9",
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 18,
      },
      createMeditationIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
      },
      createMeditationText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#3A3A38",
      },
      guidedMeditationGeneratingPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        alignSelf: "center",
        backgroundColor: "#F7F2E9",
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 18,
        minHeight: 48,
      },
      guidedMeditationGeneratingText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#3A3A38",
      },
      inputView:{
        gap:5,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingVertical: 5,
        justifyContent:"center",
      },
      inputChild:{
        flexDirection:"row",
        alignItems: "center",
        borderRadius:30,
        backgroundColor:"#F7F2E9",
        width:"90%",
        height:"auto"
      },
      inputBox:{
        flex:1,
        maxHeight:80,
        minHeight:70,
        borderRadius: 30,
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'ios' ? 10 : 8,
        paddingBottom: Platform.OS === 'ios' ? 10 : 8,
        backgroundColor: "#F7F2E9",
        fontSize: 16,
        textAlignVertical: "center",
      },
      sendButtonStyle: {
      },
      micButtonContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginRight: 3,
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.0)",
        backgroundColor: "rgba(255, 255, 255, 0.0)",
      },
      micButtonPressed: {
        backgroundColor: "#FFE7D6",
        borderColor: "#FF8A3D",
        transform: [{ scale: 0.9 }],
        shadowColor: "#FF8A3D",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
        elevation: 6,
      },
      micButtonConverting: {
        backgroundColor: "#FFF2E6",
        borderColor: "#FFB06E",
        shadowColor: "#FFB06E",
      }
})
