import { useChatAiApi } from "@/api/api";
import { useState,useCallback } from "react"
import { ChatMessageItem } from "@/api/chatMessages/types";
import { addRecentlyAccessedSession, checkIfLambdaResultIsSuccess } from "@/utils/helper";
import { useToast } from "@/context/useToast";
import { GENERAL, GUIDED_MEDITATION } from "@/constant";
import { ChatAiInput, ChatAiRequest, ChatResponseData } from "./types";
const comfortingQuotes = [
    "Even the darkest night will end and the sun will rise. - Victor Hugo",
    "You are braver than you believe, stronger than you seem, and smarter than you think. - A.A. Milne"
];

// Helper function to get a random quote
const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * comfortingQuotes.length);
    return comfortingQuotes[randomIndex];
};

type FetchAiMessageInput = string | ChatAiRequest;

const buildChatMessageItem = (
  data: ChatResponseData,
  fallbackSessionId: string,
  workflowExecuted: string | null
): ChatMessageItem => ({
  id: data.id,
  session_id: data.session_id || fallbackSessionId,
  user_id: 0,
  content: data.content,
  role: data.role || "ai",
  model: null,
  workflow_executed: workflowExecuted,
  classification: null,
  needs_stage: null,
  needs_categorization_reasoning: null,
  needs_categorization_confidence: null,
  rating: null,
  archived: false,
  created_at: null,
  updated_at: null,
  deleted_at: null,
});

export default function useFetchAiMessage (testMode:boolean = true,session_id:string) {
    const [aiMessage,setAiMessage] = useState<ChatMessageItem | null>(null);
    const [aiMode, setAiMode] = useState<string | null>(null);
    const [isAiLoading,setIsAiLoading] = useState<boolean>(false);
    const [aiError,setIsAiError] = useState<string | null>(null);
    const {chatAi:{chatAi}} = useChatAiApi()
    const {showToastMessage} = useToast()


    const fetchAiMessageTest = useCallback(async (input?: FetchAiMessageInput) => {
         console.log("Fetching comforting quote for:", input); // Log intent
        setIsAiLoading(true);
        setIsAiError(null);

        try {
            await new Promise(resolve => setTimeout(resolve, 6000)); // Use await for delay

            const randomQuote = getRandomQuote();
            const requestedMode =
              typeof input !== "string" && input?.category === GUIDED_MEDITATION
                ? GUIDED_MEDITATION
                : GENERAL;
            setAiMessage({
              id: Date.now(),
              session_id,
              user_id: 0,
              content: randomQuote,
              role: "assistant",
              model: null,
              workflow_executed: requestedMode === GUIDED_MEDITATION ? GUIDED_MEDITATION : null,
              classification: null,
              needs_stage: null,
              needs_categorization_reasoning: null,
              needs_categorization_confidence: null,
              rating: null,
              archived: false,
              created_at: null,
              updated_at: null,
              deleted_at: null,
            });
            setAiMode(requestedMode);

        } catch (error) {
            console.error("Error setting comforting quote:", error);
            setIsAiError("Sorry, something went wrong while getting a quote.");
            setAiMessage(null);
            setAiMode(null);
        } finally {
            setIsAiLoading(false);
        }
    }, [session_id]);


    const fetchAiMessageLive = useCallback(async (input:FetchAiMessageInput) => {
        const chatAiInput: ChatAiInput =
          typeof input === "string"
            ? { user_message: input, session_id }
            : { ...input, session_id };
        const requestedMode =
          chatAiInput.category === GUIDED_MEDITATION ? GUIDED_MEDITATION : GENERAL;

        console.log("human message is", chatAiInput.user_message ?? chatAiInput.category)
        setIsAiLoading(true);
        setIsAiError(null);

        try {
          const response = await chatAi(chatAiInput)
          const responseSuccess = checkIfLambdaResultIsSuccess(response)
          if (!responseSuccess){
            console.error("response was not successful",response.response,response.statusCode)
            showToastMessage("An error occurred while fetching messages",false)
            setAiMessage(null);
            setAiMode(null);
            setIsAiError("error occurred while fetching")
            return;
          }
          console.log("the response is",response)
          if (!response.data?.content) {
            console.error("chat response did not include content", response);
            showToastMessage("An error occurred while fetching messages", false);
            setAiMessage(null);
            setAiMode(null);
            setIsAiError("error occurred while fetching");
            return;
          }

          const nextAiMessage = buildChatMessageItem(
            response.data,
            session_id,
            requestedMode === GUIDED_MEDITATION ? GUIDED_MEDITATION : null
          );

          if (requestedMode === GUIDED_MEDITATION) {
            try {
              const addRecentlyAccessedSessionResult = await addRecentlyAccessedSession({
                course_number: null,
                session_number: null,
                session_length_in_mins: null,
                is_generated: 1,
                type: GUIDED_MEDITATION,
                session_title: "Guided Meditation",
                image_url: null,
                background_url: null,
                message_id: nextAiMessage.id,
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
          setAiMessage(nextAiMessage)
          setAiMode(requestedMode)
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
    const fetchMessage: (input: FetchAiMessageInput) => Promise<void> = testMode
      ? fetchAiMessageTest
      : fetchAiMessageLive;


    return {aiMessage,isAiLoading,aiError,aiMode,fetchMessage}
}
