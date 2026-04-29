import { useChatAiApi } from "@/api/api";
import { useState,useCallback } from "react"
import { LambdaResult } from "@/api/types";
import { addRecentlyAccessedSession, checkIfLambdaResultIsSuccess } from "@/utils/helper";
import { useToast } from "@/context/useToast";
import { GENERAL, GUIDED_MEDITATION } from "@/constant";
const comfortingQuotes = [
    "Even the darkest night will end and the sun will rise. - Victor Hugo",
    "You are braver than you believe, stronger than you seem, and smarter than you think. - A.A. Milne"
];

// Helper function to get a random quote
const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * comfortingQuotes.length);
    return comfortingQuotes[randomIndex];
};

export default function useFetchAiMessage (testMode:boolean = true,session_id:string) {
    const [aiMessage,setAiMessage] = useState<LambdaResult.ChatMessageItem | null>(null);
    const [aiMode, setAiMode] = useState<string | null>(null);
    const [isAiLoading,setIsAiLoading] = useState<boolean>(false);
    const [aiError,setIsAiError] = useState<string | null>(null);
    const {chatAi:{chatAi}} = useChatAiApi()
    const {showToastMessage} = useToast()


    const fetchAiMessageTest = useCallback(async (humanMessage?: string) => {
         console.log("Fetching comforting quote for:", humanMessage); // Log intent
        setIsAiLoading(true);
        setIsAiError(null); 

        try {
            await new Promise(resolve => setTimeout(resolve, 6000)); // Use await for delay

            const randomQuote = getRandomQuote();
            setAiMessage({
              id: Date.now(),
              session_id,
              user_id: 0,
              content: randomQuote,
              role: "assistant",
              model: null,
              classification: GENERAL,
              needs_stage: null,
              needs_categorization_reasoning: null,
              needs_categorization_confidence: null,
              rating: null,
              archived: false,
              created_at: null,
              updated_at: null,
              deleted_at: null,
            });
            setAiMode(GENERAL);

        } catch (error) { 
            console.error("Error setting comforting quote:", error);
            setIsAiError("Sorry, something went wrong while getting a quote.");
            setAiMessage(null); 
            setAiMode(null);
        } finally {
            setIsAiLoading(false);
        }
    }, []);


    const fetchAiMessageLive = useCallback(async (humanMessage:string) => {
        console.log("human messag is",humanMessage)
        setIsAiLoading(true);
        setIsAiError(null); 


        // let full_url = baseUrl + "/2015-03-31/functions/function/invocations"
        // console.log("the full url is",full_url)
        
        try {
          // const response = await fetch(full_url, {
          //   method: 'POST',
          //   headers: {
          //     Accept: 'application/json',
          //     'Content-Type': 'application/json',
          //   },
          //   body: JSON.stringify({
          //     mode: "q_and_a",
          //   //   question: "How to maintain mindful and one-pointed-focus during the day?"
          //   question:humanMessage
          //   })
          // });

          // console.log("status", response.status);
          // console.log("OK", response.ok);

          // const text = await response.text(); // get actual content
          // console.log("Response body:", text);
          // const data = JSON.parse(text);
  
          const response = await chatAi({
            question:humanMessage,
            session_id
          })
          const responseSuccess = checkIfLambdaResultIsSuccess(response)
          if (!responseSuccess){
            console.error("response was not successful",response.response,response.statusCode)
            showToastMessage("An error occurred while fetching messages",false)
            setAiMessage(null);
            setAiMode(null);
            setIsAiError("error occurred while fetching")
            return;
          }
          //TODO: if the mode is GUIDED_MEDITATION then we want to 
          console.log("the response is",response)
          if (response.data?.classification === GUIDED_MEDITATION) {
            try {
              const addRecentlyAccessedSessionResult = await addRecentlyAccessedSession({
                course_number: null,
                session_number: null,
                session_length_in_mins: null,
                is_generated: 1,
                type: GUIDED_MEDITATION,
                session_title: response.data.session_title ?? "Guided Meditation",
                image_url: null,
                background_url: null,
                message_id: response.data.message_id ?? response.data.id,
              });

              if (!checkIfLambdaResultIsSuccess(addRecentlyAccessedSessionResult)) {
                console.error(
                  "Failed to add recently accessed guided meditation",
                  addRecentlyAccessedSessionResult
                );
              }
            } catch (error) {
              console.error("Failed to add recently accessed guided meditation", error);
            }
          }
          setAiMessage(response.data ?? null)
          setAiMode(
            response.data.classification
          )
          setIsAiLoading(false)
          setIsAiError(null)
        } catch (err) {
          console.error("Fetch error:", err);
            setAiMessage(null);
            setAiMode(null);
            setIsAiError("error occurred while fetching")
        } finally {
          setIsAiLoading(false)
        }
    }, [chatAi, session_id, showToastMessage]);
    let fetchMessage 

    if (testMode){
        fetchMessage = fetchAiMessageTest;
    } else {
        fetchMessage = fetchAiMessageLive;
    }

   
    return {aiMessage,isAiLoading,aiError,aiMode,fetchMessage}
}
