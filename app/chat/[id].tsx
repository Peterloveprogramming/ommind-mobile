import {ImageBackground, StyleSheet,Text,View,TextInput, Platform, TouchableOpacity,FlatList,KeyboardAvoidingView} from 'react-native' // Added Platform
import React, { useEffect } from 'react'
import { useState,useRef } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { images } from '@/constants/images'
import { generateRandomNumber } from '@/utils/helper'
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
  } from "expo-speech-recognition";
import SendButton from '@/assets/svg/chat/SendButton'
import MicButton from '@/assets/svg/chat/MicButton' 
import PrecautionButton from '@/assets/svg/chat/PrecautionButton'
import Ai from '@/comp/chat/Ai'
import Human from '@/comp/chat/Human'
import useFetchAiMessage from '@/services/useFetchAiMessage'
import { useToast } from '@/context/useToast'
import { useWebsocketHexPcmAudio } from "@/services/useWebsocketHexPcmAudio";
import { GUIDED_MEDITATION } from "@/constant";

const SpiritualMentorChat = () => {
    const { id, session_id } = useLocalSearchParams()
    const [recognizing, setRecognizing] = useState(false);
    const {aiMessage,isAiLoading,aiError,aiMode,fetchMessage} = useFetchAiMessage(false,session_id);
    const { playAudio } = useWebsocketHexPcmAudio();
    const [messages,setMessages] = useState([])
    const [inputText, setInputText] = useState(""); 
    const flatListRef = useRef(null);
    const fullInterimTranscript = useRef(null);
    const lastInterimWord = useRef(null)
   
    console.log("session_id is",session_id)
    console.log("id is",id)
    const {showToastMessage} = useToast()
    if (!session_id){
      showToastMessage("session_id is is not present",false);
    }

    useEffect(() => {
      // Only run this logic if a new aiMessage has arrived
      if (aiMessage) {
        setMessages(prevMessages => {
          // Get the last message from the current state
          const lastMessage = prevMessages[prevMessages.length - 1];
    
          // Check if the last message exists and is the AI's "loading" message
          if (lastMessage && lastMessage.ai === "loading") {
            // If yes, return a new array containing all messages *except* the last one,
            // and then append the new actual aiMessage.
            return [
              ...prevMessages.slice(0, -1), // All messages except the last
              { ai: aiMessage, id: generateRandomNumber() } // The new AI message
            ];
          } else {
            // If the last message wasn't "loading", just append the new aiMessage
            return [
              ...prevMessages,
              { ai: aiMessage, id: generateRandomNumber() }
            ];
          }
        });
    
        // Scroll to the end after the state update has been processed.
        // A shorter timeout is usually sufficient.
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100); // Reduced delay to 100ms
      }
      if (aiMessage && aiMode === GUIDED_MEDITATION) {
        (async () => {
          try {
            await playAudio(String(aiMessage));
          } catch (error) {
            console.error("Play audio failed:", error);
          }
        })();
      }
      return () => {
        setRecognizing(false);
      }
    }, [aiMessage, aiMode, playAudio]); 
    

    useEffect(()=>{
      if (isAiLoading){
        setTimeout(() => {
          setMessages(prevMessages => [...prevMessages, { ai: "loading", id: generateRandomNumber() }]);
        }, 1000); 
      }

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 2000); 

    },[isAiLoading])

    // ... (rest of your speech recognition hooks and functions remain the same)
    useSpeechRecognitionEvent("start", () => {
      console.log("started listening")
      setRecognizing(true)
      fullInterimTranscript.current = null;
      
    });
    useSpeechRecognitionEvent("end", () => {
      console.log("stopped listening")
      setRecognizing(false)
      lastInterimWord.current = null;
    });
    useSpeechRecognitionEvent("result", (event) => {
      let transcript = event.results[0]?.transcript || '';
        if (transcript){
          // prevent edge cases on ios 
          if (fullInterimTranscript.current == transcript){
            fullInterimTranscript.current = null;
            return;
          }
          fullInterimTranscript.current = transcript
          let transcriptArray = transcript.split(" ");
          let word = transcriptArray[transcriptArray.length-1]
          // add spacing between the transcript 
          if (inputText.length >0){
            if (lastInterimWord.current){
              let wordLowerCase = word.toLocaleLowerCase();
              let lastInterimWordLowerCase = lastInterimWord.current.toLocaleLowerCase();
              // prevent doubling up like potential potentially 
              if (wordLowerCase == lastInterimWordLowerCase){
                return
              }
              if (wordLowerCase.includes(lastInterimWordLowerCase) && lastInterimWordLowerCase != wordLowerCase){
                let inputTextArray = inputText.split(" ");
                inputTextArray.pop()
                inputTextArray.push(word)
                let inputTextString = inputTextArray.join(" ") 
                lastInterimWord.current = word; 
                setInputText(inputTextString)
                return
              }
            }
            lastInterimWord.current = word;
            transcript = " "+word
          } else {
            transcript = word
          }
        }
      
      console.log(fullInterimTranscript.current)
      // Check if the recognized text is "send"

      // If it's not "send", append the transcript to the input text
      setInputText(prevText => prevText + transcript);
      
  });
  
    useSpeechRecognitionEvent("error", (event) => {
        console.log("error code:", event.error, "error message:", event.message);
    });
    
    
    
    // Modify handleRecognition to accept an optional 'stopOnly' parameter
    const handleRecognition = async (stopOnly: boolean = false) => {
      if (stopOnly) {
          // If stopOnly is true, only attempt to stop if currently recognizing
          if (recognizing) {
              ExpoSpeechRecognitionModule.stop();
              console.log("handle stop pressed (from send)");
          }
          return; // Exit the function after attempting to stop
      }

      // --- Original Toggle Logic (if stopOnly is false) ---
      if (recognizing) {
          // If recognizing, stop it (when toggled by button press)
          ExpoSpeechRecognitionModule.stop();
          console.log("handle stop pressed (toggle)");
          return; // Exit after stopping
      }
  
      // If not recognizing and not stopOnly, start recognition
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
          console.warn("Permissions not granted", result);
          return;
      }

      // Start speech recognition
      ExpoSpeechRecognitionModule.start(
        {
          lang: "en-US",
          interimResults: true,
          maxAlternatives: 1,
          continuous: true,
          requiresOnDeviceRecognition: false,
          addsPunctuation: Platform.OS === 'ios' ? false : true,
      });
      lastInterimWord.current = null;
      console.log("handle start pressed (toggle)");
  };
  

  const handleSend = () => {

    //checks 
    if (inputText.trim().length === 0) {
      return; 
    }
    if (isAiLoading){
      return;
    }
    handleRecognition(true);
    const newMessage = { human: inputText, id: generateRandomNumber() };

    // 1. Update state
    setMessages(prevMessages => [...prevMessages, newMessage]);

    // 2. Call API (can happen concurrently with state update)
    fetchMessage(inputText);

    // 3. Clear input
    setInputText('');

    // 4. Scroll to end (after state update has likely rendered)
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 500); // A small delay (e.g., 100ms) ensures the list has time to re-render
  };
    
    return (
      <View style={styles.Parent}>
      <KeyboardAvoidingView
        style={{ flex: 1 }} // <-- Add this style for flexibility
        behavior='padding'
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
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
              keyExtractor={(item) => item.id.toString()} 
              renderItem={({ item }) => { 
                if (item.ai) {
                    // If the 'ai' property exists, render the Ai component
                    return <Ai message={item.ai} />;
                } else if (item.human) {
                    // If the 'human' property exists, render the Human component
                    return <Human message={item.human} />;
                }
                  // Optionally return null or a placeholder if neither exists (shouldn't happen with your current structure)
                  return null;
              }}
              />
            </View>
          </View>
          
          <View style={styles.inputView}>
            <View style={styles.inputChild}>

              {/* message box  */}
              <TextInput
                style={styles.inputBox}
                placeholder="Tap here to reply"
                placeholderTextColor="#999"
                value={inputText} 
                multiline={true} 
                onChange={(e) => setInputText(e.nativeEvent.text)}
                // numberOfLines={1} // You can optionally set initial number of lines, but multiline handles it
              />

              {/* mic button */}
              <TouchableOpacity 
                onPress={() => handleRecognition()} // Call without arguments for toggle behavior
                style={{justifyContent:"center",alignItems:"center",marginRight:3}}
              >
                <MicButton />
              </TouchableOpacity>
            </View>

            {/* send button */}
            <View style={styles.sendButtonStyle}>
              <TouchableOpacity onPress={handleSend}>
                <SendButton />
              </TouchableOpacity>
            </View>

          </View>
          </KeyboardAvoidingView>
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
        // height:"12%",
        gap:5,
        borderWidth:1,
        // Remove fixed height, let it grow
        flexDirection: 'row',
        alignItems: 'center', // Align items to the bottom
        paddingHorizontal: 10,
        paddingVertical: 8, // Add some vertical padding
        borderTopColor: '#ccc',
        backgroundColor: 'rgba(129, 129, 129, 0.5)',
      },
      inputChild:{
        flexDirection:"row",
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
        minHeight:50,
        // borderColor: '#ccc',
        borderRadius: 20, // Slightly smaller radius might look better with multiline
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'ios' ? 10 : 8, // Adjust vertical padding inside
        paddingBottom: Platform.OS === 'ios' ? 10 : 8,
        backgroundColor: "white",
        fontSize: 16,
        // borderWidth:3,
        // marginRight: 10,
        // textAlignVertical: 'top', // Ensures text starts from the top in Android multiline
      },
      sendButtonStyle: {
      }
})
