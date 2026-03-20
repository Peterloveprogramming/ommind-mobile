import { StyleSheet,Text,View,TextInput, Platform, TouchableOpacity,FlatList,KeyboardAvoidingView, Keyboard, ActivityIndicator} from 'react-native'
import React, { useEffect, useLayoutEffect } from 'react'
import { useState,useRef } from 'react'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { generateRandomNumber } from '@/utils/helper'
import SendButton from '@/assets/svg/chat/SendButton'
import MicButton from '@/assets/svg/chat/MicButton' 
import PrecautionButton from '@/assets/svg/chat/PrecautionButton'
import Ai from '@/comp/chat/Ai'
import Human from '@/comp/chat/Human'
import OpenChatHistoryButton from '@/comp/headers/OpenChatHistoryButton'
import useFetchAiMessage from '@/services/useFetchAiMessage'
import { useToast } from '@/context/useToast'
import { useWebsocketHexPcmAudio } from "@/services/useWebsocketHexPcmAudio";
import { GUIDED_MEDITATION } from "@/constant";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlaybackStatus } from '@/services/hexPcmAudioPlayer';
import { useHeaderHeight } from '@react-navigation/elements';
import { useVoiceToText } from '@/services/useVoiceToText';

const COMPOSER_BOTTOM_SPACE = 96;
const ANDROID_KEYBOARD_CLEARANCE = 36;

type ChatMessage = {
  id: number;
  ai?: string;
  human?: string;
  mode?: string | null;
  showSpinner?: boolean;
  isPlaybackPaused?: boolean;
};

const SpiritualMentorChat = () => {
    const { id, session_id } = useLocalSearchParams()
    const router = useRouter();
    const navigation = useNavigation();
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isMicPressed, setIsMicPressed] = useState(false);
    const [inputText, setInputText] = useState("");
    const {showToastMessage} = useToast()
    const {aiMessage,isAiLoading,aiError,aiMode,fetchMessage} = useFetchAiMessage(false,session_id);
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
    const flatListRef = useRef<FlatList<ChatMessage> | null>(null);
    const insets = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const Container = Platform.OS === "ios" ? KeyboardAvoidingView : View;
    const androidKeyboardInset = Platform.OS === "android" ? Math.max(0, keyboardHeight - insets.bottom) : 0;
    const androidComposerLift = Platform.OS === "android" && androidKeyboardInset > 0
      ? androidKeyboardInset + ANDROID_KEYBOARD_CLEARANCE
      : 0;
    const composerBottomInset = COMPOSER_BOTTOM_SPACE + insets.bottom + androidComposerLift;
    const isGuidedMeditationInProgress =
      playbackStatus === "buffering" ||
      playbackStatus === "playing" ||
      playbackStatus === "paused";

    useLayoutEffect(() => {
      navigation.setOptions({
        headerRight: () => (
          <OpenChatHistoryButton
            onTouch={() => {
              if (!id) {
                return;
              }

              router.push({
                pathname: "/chat/history/[id]",
                params: {
                  id: String(id),
                  ...(session_id ? { session_id: String(session_id) } : {}),
                },
              });
            }}
          />
        ),
      });
    }, [id, navigation, router, session_id]);

    console.log("session_id is",session_id)
    console.log("id is",id)
    if (!session_id){
      showToastMessage("session_id is is not present",false);
    }

    const updateLatestGuidedMeditationMessage = (status: PlaybackStatus) => {
      setMessages(prevMessages => {
        const guidedMessageIndex = [...prevMessages]
          .reverse()
          .findIndex(message => message.mode === GUIDED_MEDITATION && message.showSpinner);

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
              ai: "Guided meditation ended",
              showSpinner: false,
              isPlaybackPaused: false,
            };
          }

          if (status === "paused") {
            return {
              ...message,
              ai: "Guided meditation paused",
              isPlaybackPaused: true,
            };
          }

          if (status === "playing" || status === "buffering") {
            return {
              ...message,
              ai: "Guided meditation playing",
              isPlaybackPaused: false,
            };
          }

          return message;
        });
      });
    };

    const handleGuidedMeditationPlaybackPress = async () => {
      if (playbackStatus === "paused") {
        await resume();
        return;
      }

      if (playbackStatus === "playing" || playbackStatus === "buffering") {
        await pause();
      }
    };

    const scrollToLatestMessage = (delay = 100) => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, delay);
    };

    useEffect(() => {
      // Only run this logic if a new aiMessage has arrived
      if (aiMessage) {
        setMessages(prevMessages => {
          const nextAiMessage: ChatMessage =
            aiMode === GUIDED_MEDITATION
              ? {
                  ai: "Guided meditation playing",
                  id: generateRandomNumber(),
                  mode: GUIDED_MEDITATION,
                  showSpinner: true,
                  isPlaybackPaused: false,
                }
              : { ai: String(aiMessage), id: generateRandomNumber(), mode: aiMode };
          const lastMessage = prevMessages[prevMessages.length - 1];

          if (lastMessage && lastMessage.ai === "loading") {
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
            await playAudio(String(aiMessage));
          } catch (error) {
            console.error("Play audio failed:", error);
          }
        })();
      }
    }, [aiMessage, aiMode, playAudio]); 

    useEffect(() => {
      if (playbackStatus === "idle") {
        return;
      }

      updateLatestGuidedMeditationMessage(playbackStatus);
    }, [playbackStatus]);

    useEffect(() => {
      if (Platform.OS !== "android") {
        return;
      }

      const showSubscription = Keyboard.addListener("keyboardDidShow", (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      });

      const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardHeight(0);
      });

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }, []);

    useEffect(() => {
      return () => {
        void dispose();
      };
    }, [dispose]);

    useEffect(() => {
      if (!aiError) {
        return;
      }

      setMessages(prevMessages => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (!lastMessage || lastMessage.ai !== "loading") {
          return prevMessages;
        }

        return prevMessages.slice(0, -1);
      });
    }, [aiError]);
    

    useEffect(()=>{
      let loadingMessageTimeout: ReturnType<typeof setTimeout> | null = null;
      if (isAiLoading){
        console.log("ai is loading...")
        loadingMessageTimeout = setTimeout(() => {
          setMessages(prevMessages => [...prevMessages, { ai: "loading", id: generateRandomNumber() }]);
        }, 1000); 
      }

      scrollToLatestMessage(2000); 
      return () => {
        if (loadingMessageTimeout) {
          clearTimeout(loadingMessageTimeout);
        }
      };
    },[isAiLoading])

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
    if (isAiLoading){
      return;
    }
    if (isConverting){
      showToastMessage("Voice note is currently converting. Please wait a moment.", false);
      return;
    }
    const newMessage: ChatMessage = { human: inputText, id: generateRandomNumber() };

    // 1. Update state
    setMessages(prevMessages => [...prevMessages, newMessage]);

    // 2. Call API (can happen concurrently with state update)
    fetchMessage(inputText);

    // 3. Clear input
    setInputText('');

    // 4. Scroll to end (after state update has likely rendered)
    scrollToLatestMessage(500);
  };
    
    return (
      <View style={styles.Parent}>
      <Container
        style={styles.parentView}
        {...(Platform.OS === "ios"
          ? {
              behavior: "padding" as const,
              keyboardVerticalOffset: headerHeight,
            }
          : {})}
      >
          <View style={styles.chatViewParent}>
            <View style={styles.chatviewChild}>
              <View style={styles.precautionViewStyle}>
                <Text style={styles.precautionText}>Precautionary note</Text>
                <PrecautionButton />
              </View>

              <FlatList 
                data={messages}
                ref={flatListRef}
                contentContainerStyle={{ paddingBottom: composerBottomInset }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                onContentSizeChange={() => scrollToLatestMessage(0)}
                keyExtractor={(item) => item.id.toString()} 
                renderItem={({ item }) => { 
                  if (item.ai) {
                      return (
                        <Ai
                          message={item.ai}
                          showPlaybackControl={item.showSpinner}
                          showPlayButton={item.isPlaybackPaused}
                          onPlaybackControlPress={handleGuidedMeditationPlaybackPress}
                        />
                      );
                  } else if (item.human) {
                      return <Human message={item.human} />;
                  }
                    return null;
                }}
              />
            </View>
          </View>
          
          <View style={[styles.inputView,{paddingBottom:insets.bottom, marginBottom: androidComposerLift}]}>
            <View style={styles.inputChild}>
            
              {/* message box  */}
              <TextInput
                style={styles.inputBox}
                placeholder="Tap here to reply"
                placeholderTextColor="#999"
                value={inputText} 
                multiline={true} 
                onChange={(e) => setInputText(e.nativeEvent.text)}
                onFocus={() => scrollToLatestMessage()}
                // numberOfLines={1} // You can optionally set initial number of lines, but multiline handles it
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
          </Container>
      </View>
    )
}


export default SpiritualMentorChat

const styles = StyleSheet.create({
    Parent: {
        flex: 1,
      },
      parentView:{ // This style isn't used currently
        flex:1,
      },
      chatViewParent:{
        flex: 1, // Let chat view take up remaining space
      },
      scrollViewStyle:{
        flex:1,
        // backgroundColor:"black"
      },
      scrollViewContentContainer: {
        flexGrow: 1, // Allows the container to grow and fill the ScrollView
        // You could also add justifyContent: 'flex-end' if you want content
        // to start from the bottom, typical for chats, but maybe handle that
        // inside chatviewChild depending on your message layout.
      },
      precautionViewStyle:{
        flexDirection:"row",
        gap:"5",
        alignItems:"center",
        justifyContent:"center",
        padding:5,
        // borderWidth:3,
      },
      precautionText:{
        color: 'rgba(71, 71, 71, 0.5)',
      },
      chatviewChild :{
        // borderWidth:1,
        flex:1,
        // backgroundColor:"black",
        paddingVertical:10,
        paddingHorizontal: 10, // Add this line
      },
      inputView:{
        height:"20%",
        gap:5,
        // borderWidth:1,
        // Remove fixed height, let it grow
        flexDirection: 'row',
        alignItems: 'center', // Align items to the bottom
        paddingHorizontal: 5,
        paddingVertical: 5, // Add some vertical padding
        borderTopColor: '#ccc',
        justifyContent:"center",
        backgroundColor: 'rgba(129, 129, 129, 0.5)',
      },
      inputChild:{
        flexDirection:"row",
        alignItems: "center",
        // borderWidth:2,
        borderRadius:20,
        backgroundColor:"white",
        width:"90%",
        height:"auto"
      },
      inputBox:{
        // borderWidth:2,
        flex:1,
        // Remove fixed height: '60%'
        maxHeight:80,
        minHeight:70,
        // borderColor: '#ccc',
        borderRadius: 20, // Slightly smaller radius might look better with multiline
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'ios' ? 10 : 8, // Adjust vertical padding inside
        paddingBottom: Platform.OS === 'ios' ? 10 : 8,
        backgroundColor: "white",
        fontSize: 16,
        textAlignVertical: "center",
        // borderWidth:3,
        // marginRight: 10,
        // textAlignVertical: 'top', // Ensures text starts from the top in Android multiline
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
