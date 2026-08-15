import { useChatAiApi } from "@/api/api";
import { useCallback, useRef, useState } from "react"
import { ChatMessageItem } from "@/api/chatMessages/types";
import { addRecentlyAccessedSession, checkIfLambdaResultIsSuccess, generateRequestId } from "@/utils/helper";
import { useToast } from "@/context/useToast";
import { GENERAL, GUIDED_MEDITATION } from "@/constant";
import { ChatAiInput, ChatAiRequest, ChatResponseData } from "./types";
import { addChatBreadcrumb, captureChatException } from "@/utils/chatTelemetry";

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
    // requestId that produced the current aiMessage/aiError, used by the chat
    // screen to correlate a response back to the human message/placeholder
    // that triggered it, instead of assuming it's always the last item.
    const [aiRequestId, setAiRequestId] = useState<string | null>(null);
    // requestId of the currently in-flight request, so a "loading" placeholder
    // created while this is true can be tagged with the right requestId.
    const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
    const {chatAi:{chatAi}} = useChatAiApi()
    const {showToastMessage} = useToast()

    // Bumped on every fetchAiMessageLive call; a call only applies its result
    // to state if this still matches the value it captured when it started.
    // This is what makes a stale (superseded) response a no-op instead of
    // silently overwriting a newer one.
    const requestGenerationRef = useRef(0);
    const abortControllerRef = useRef<AbortController | null>(null);

    const reset = useCallback(() => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        requestGenerationRef.current += 1;
        setAiMessage(null);
        setAiMode(null);
        setIsAiLoading(false);
        setIsAiError(null);
        setAiRequestId(null);
        setActiveRequestId(null);
    }, []);

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


    const fetchAiMessageLive = useCallback(async (input:FetchAiMessageInput, requestId?: string) => {
        const activeRequest = requestId ?? generateRequestId();
        const chatAiInput: ChatAiInput =
          typeof input === "string"
            ? { user_message: input, session_id, request_id: activeRequest }
            : { ...input, session_id, request_id: activeRequest };
        const requestedMode =
          chatAiInput.category === GUIDED_MEDITATION ? GUIDED_MEDITATION : GENERAL;

        // Supersede any request from this hook instance that's still in
        // flight: cancel its network call and make its eventual resolution
        // a no-op via the generation bump below.
        // There can only ever be one abortController per 1 hook instance. 
        abortControllerRef.current?.abort();
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        const myGeneration = ++requestGenerationRef.current;
        const isCurrent = () => requestGenerationRef.current === myGeneration;

        console.log("human message is", chatAiInput.user_message ?? chatAiInput.category)
        addChatBreadcrumb("message_sent", { request_id: activeRequest, session_id, mode: requestedMode });
        setActiveRequestId(activeRequest);
        setIsAiLoading(true);
        setIsAiError(null);

        try {
          const response = await chatAi(chatAiInput, { signal: abortController.signal })
          if (!isCurrent()) {
            addChatBreadcrumb("ai_response_discarded_stale", { request_id: activeRequest, session_id });
            return;
          }
          const responseSuccess = checkIfLambdaResultIsSuccess(response)
          if (!responseSuccess){
            console.error("response was not successful",response.response,response.statusCode)
            if (response.statusCode === 409) {
              showToastMessage("A response is already being generated for this chat. Please wait a moment.", false);
            } else {
              showToastMessage("An error occurred while fetching messages",false)
            }
            captureChatException(new Error(`chat request failed: ${response.statusCode}`), {
              request_id: activeRequest,
              session_id,
              statusCode: response.statusCode,
            });
            setAiMessage(null);
            setAiMode(null);
            setAiRequestId(activeRequest);
            setIsAiError("error occurred while fetching")
            return;
          }
          console.log("the response is",response)
          if (!response.data?.content) {
            console.error("chat response did not include content", response);
            showToastMessage("An error occurred while fetching messages", false);
            setAiMessage(null);
            setAiMode(null);
            setAiRequestId(activeRequest);
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
          if (!isCurrent()) {
            addChatBreadcrumb("ai_response_discarded_stale", { request_id: activeRequest, session_id });
            return;
          }
          addChatBreadcrumb("ai_response_received", { request_id: activeRequest, session_id, mode: requestedMode });
          setAiMessage(nextAiMessage)
          setAiMode(requestedMode)
          setAiRequestId(activeRequest)
          setIsAiError(null)
        } catch (err) {
          const isAbort = err instanceof Error && err.name === "AbortError";
          if (isAbort) {
            addChatBreadcrumb("ai_request_superseded", { request_id: activeRequest, session_id });
            return;
          }
          console.error("Fetch error:", err);
          captureChatException(err, { request_id: activeRequest, session_id });
          if (!isCurrent()) {
            return;
          }
          setAiMessage(null);
          setAiMode(null);
          setAiRequestId(activeRequest);
          setIsAiError("error occurred while fetching")
        } finally {
          if (isCurrent()) {
            setIsAiLoading(false)
            setActiveRequestId(null)
          }
          // reset AbortController 
          if (abortControllerRef.current === abortController) {
            abortControllerRef.current = null;
          }
        }
    }, [chatAi, session_id, showToastMessage]);
    const fetchMessage: (input: FetchAiMessageInput, requestId?: string) => Promise<void> = testMode
      ? fetchAiMessageTest
      : fetchAiMessageLive;


    return {aiMessage,isAiLoading,aiError,aiMode,aiRequestId,activeRequestId,fetchMessage,reset}
}
