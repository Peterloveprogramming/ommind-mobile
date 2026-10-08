import { useChatAiApi } from "@/api/api";
import { useCallback, useRef, useState } from "react"
import { ChatMessageItem } from "@/api/chatMessages/types";
import { addRecentlyAccessedSession, checkIfLambdaResultIsSuccess, generateRequestId } from "@/utils/helper";
import { useToast } from "@/context/useToast";
import { DREAM, GENERAL, GUIDED_MEDITATION } from "@/constant";
import { ActiveChatJobData, ChatAiInput, ChatAiRequest, ChatJobData, ChatResponseData } from "./types";
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

// Dream analysis by saved dream log: submitted via the analyze_dream route,
// which loads the dream text and details server-side.
type DreamAnalysisRequest = { dream_log_id: number | string };
type FetchAiMessageInput = string | ChatAiRequest | DreamAnalysisRequest;

const isDreamAnalysisRequest = (
  input: FetchAiMessageInput | undefined
): input is DreamAnalysisRequest =>
  typeof input === "object" && input !== null && "dream_log_id" in input;

const getRequestedMode = (category?: ChatAiRequest["category"]) =>
  category === GUIDED_MEDITATION
    ? GUIDED_MEDITATION
    : category === DREAM
      ? DREAM
      : GENERAL;

const getWorkflowExecutedForMode = (mode: string | null) =>
  mode === GUIDED_MEDITATION || mode === DREAM ? mode : null;

// Poll every 2s for up to 330s (a bit more than the server's 300s max job age).
const CHAT_JOB_POLL_INTERVAL_MS = 2000;
const CHAT_JOB_POLL_CAP_MS = 330000;

const isAbortError = (err: unknown) => err instanceof Error && err.name === "AbortError";

// Waits `ms`, rejecting with an AbortError as soon as `signal` aborts so
// reset()/supersede stop polling immediately. `wakeRef` lets the caller end
// the wait early (e.g. when the app returns to the foreground).
const sleepUnlessAborted = (
  ms: number,
  signal: AbortSignal,
  wakeRef: { current: (() => void) | null }
) =>
  new Promise<void>((resolve, reject) => {
    const abortError = () => {
      const error = new Error("Polling aborted");
      error.name = "AbortError";
      return error;
    };
    if (signal.aborted) {
      reject(abortError());
      return;
    }
    const cleanup = () => {
      clearTimeout(timeoutId);
      signal.removeEventListener("abort", onAbort);
      if (wakeRef.current === wake) {
        wakeRef.current = null;
      }
    };
    const wake = () => {
      cleanup();
      resolve();
    };
    const onAbort = () => {
      cleanup();
      reject(abortError());
    };
    const timeoutId = setTimeout(wake, ms);
    signal.addEventListener("abort", onAbort, { once: true });
    wakeRef.current = wake;
  });

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
    // Human message of a job resumed after a remount: it's only saved to the
    // DB together with the AI reply, so the screen renders it optimistically.
    const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
    const {chatAi:{chatSubmit, analyzeDream, chatJobStatus, getActiveChatJob}} = useChatAiApi()
    const {showToastMessage} = useToast()

    // Bumped on every fetchAiMessageLive call; a call only applies its result
    // to state if this still matches the value it captured when it started.
    // This is what makes a stale (superseded) response a no-op instead of
    // silently overwriting a newer one.
    const requestGenerationRef = useRef(0);
    const abortControllerRef = useRef<AbortController | null>(null);
    // request_id currently being submitted/polled, if any.
    const inFlightRequestIdRef = useRef<string | null>(null);
    // Resolves the current poll sleep early (see wakePolling).
    const wakePollRef = useRef<(() => void) | null>(null);

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
        setPendingUserMessage(null);
        inFlightRequestIdRef.current = null;
    }, []);

    const fetchAiMessageTest = useCallback(async (input?: FetchAiMessageInput) => {
         console.log("Fetching comforting quote for:", input); // Log intent
        setIsAiLoading(true);
        setIsAiError(null);

        try {
            await new Promise(resolve => setTimeout(resolve, 6000)); // Use await for delay

            const randomQuote = getRandomQuote();
            const requestedMode = isDreamAnalysisRequest(input)
              ? DREAM
              : getRequestedMode(typeof input !== "string" ? input?.category : undefined);
            setAiMessage({
              id: Date.now(),
              session_id,
              user_id: 0,
              content: randomQuote,
              role: "assistant",
              model: null,
              workflow_executed: getWorkflowExecutedForMode(requestedMode),
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


    // Settles a finished job (or a client-side failure) into hook state.
    // Returns once state has been applied; callers check isCurrent() first.
    const applyJobError = useCallback((requestId: string, errorCode?: string | null) => {
        if (errorCode === "session_busy") {
          showToastMessage("A response is already being generated for this chat. Please wait a moment.", false);
        } else {
          showToastMessage("An error occurred while fetching messages", false);
        }
        setAiMessage(null);
        setAiMode(null);
        setAiRequestId(requestId);
        setIsAiError("error occurred while fetching");
    }, [showToastMessage]);

    const applySucceededJob = useCallback(async (
      job: ChatJobData,
      requestId: string,
      requestedMode: string,
      isCurrent: () => boolean
    ) => {
        if (!job.message?.content) {
          console.error("chat job succeeded without content", job);
          applyJobError(requestId);
          return;
        }

        const nextAiMessage = buildChatMessageItem(
          job.message,
          session_id,
          getWorkflowExecutedForMode(requestedMode)
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
          addChatBreadcrumb("ai_response_discarded_stale", { request_id: requestId, session_id });
          return;
        }
        addChatBreadcrumb("ai_response_received", { request_id: requestId, session_id, mode: requestedMode });
        setAiMessage(nextAiMessage)
        setAiMode(requestedMode)
        setAiRequestId(requestId)
        setIsAiError(null)
    }, [applyJobError, session_id]);

    // Handles a job snapshot. Returns true when the job is finished (state
    // applied), false when it's still queued/running.
    const settleJob = useCallback(async (
      job: ChatJobData,
      requestId: string,
      requestedMode: string,
      isCurrent: () => boolean
    ) => {
        if (job.status === "succeeded") {
          await applySucceededJob(job, requestId, requestedMode, isCurrent);
          return true;
        }
        if (job.status === "failed") {
          addChatBreadcrumb("chat_job_failed", { request_id: requestId, session_id, error_code: job.error_code });
          captureChatException(new Error(`chat job failed: ${job.error_code}`), {
            request_id: requestId,
            session_id,
            error_code: job.error_code,
          });
          applyJobError(requestId, job.error_code);
          return true;
        }
        return false;
    }, [applyJobError, applySucceededJob, session_id]);

    // Polls chat_job_status until the job finishes, the cap is reached, or the
    // request is superseded/aborted. Shared by fresh sends and resumeJob.
    const pollChatJob = useCallback(async (
      requestId: string,
      requestedMode: string,
      signal: AbortSignal,
      isCurrent: () => boolean
    ) => {
        const startedAt = Date.now();
        while (true) {
          if (signal.aborted || !isCurrent()) {
            addChatBreadcrumb("ai_request_superseded", { request_id: requestId, session_id });
            return;
          }

          try {
            const response = await chatJobStatus({ request_id: requestId, session_id }, { signal });
            if (!isCurrent()) {
              addChatBreadcrumb("ai_response_discarded_stale", { request_id: requestId, session_id });
              return;
            }
            if (response.statusCode === 404) {
              captureChatException(new Error("chat job not found"), { request_id: requestId, session_id });
              applyJobError(requestId);
              return;
            }
            if (checkIfLambdaResultIsSuccess(response) && response.data) {
              if (await settleJob(response.data, requestId, requestedMode, isCurrent)) {
                return;
              }
            } else {
              // 5xx etc. doesn't end the job; keep polling until the cap.
              addChatBreadcrumb("chat_job_poll_failed", {
                request_id: requestId,
                session_id,
                statusCode: response.statusCode,
              });
            }
          } catch (err) {
            if (isAbortError(err) && signal.aborted) {
              addChatBreadcrumb("ai_request_superseded", { request_id: requestId, session_id });
              return;
            }
            // Network blip / timeout: keep polling until the cap.
            addChatBreadcrumb("chat_job_poll_failed", {
              request_id: requestId,
              session_id,
              error: err instanceof Error ? err.message : String(err),
            });
          }

          // Checked after a poll, so returning from the background past the
          // cap still gets one final answer from the server first.
          if (Date.now() - startedAt >= CHAT_JOB_POLL_CAP_MS) {
            captureChatException(new Error("chat job polling cap reached"), { request_id: requestId, session_id });
            applyJobError(requestId);
            return;
          }

          try {
            await sleepUnlessAborted(CHAT_JOB_POLL_INTERVAL_MS, signal, wakePollRef);
          } catch {
            addChatBreadcrumb("ai_request_superseded", { request_id: requestId, session_id });
            return;
          }
        }
    }, [applyJobError, chatJobStatus, session_id, settleJob]);

    // Supersedes whatever this hook instance is doing and starts tracking
    // `requestId` as the in-flight request.
    const beginRequest = useCallback((requestId: string) => {
        abortControllerRef.current?.abort();
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        const myGeneration = ++requestGenerationRef.current;
        const isCurrent = () => requestGenerationRef.current === myGeneration;
        inFlightRequestIdRef.current = requestId;

        setActiveRequestId(requestId);
        setIsAiLoading(true);
        setIsAiError(null);

        const finish = () => {
          if (isCurrent()) {
            setIsAiLoading(false)
            setActiveRequestId(null)
            setPendingUserMessage(null)
            inFlightRequestIdRef.current = null;
          }
          // reset AbortController
          if (abortControllerRef.current === abortController) {
            abortControllerRef.current = null;
          }
        };

        return { abortController, isCurrent, finish };
    }, []);

    const fetchAiMessageLive = useCallback(async (input:FetchAiMessageInput, requestId?: string) => {
        const activeRequest = requestId ?? generateRequestId();
        const dreamAnalysis = isDreamAnalysisRequest(input) ? input : null;
        const chatAiInput: ChatAiInput | null =
          dreamAnalysis
            ? null
            : typeof input === "string"
              ? { user_message: input, session_id, request_id: activeRequest }
              : { ...(input as ChatAiRequest), session_id, request_id: activeRequest };
        const requestedMode = dreamAnalysis
          ? DREAM
          : getRequestedMode(chatAiInput?.category);

        // Supersede any request from this hook instance that's still in
        // flight: stop its polling and make its eventual resolution a no-op
        // via the generation bump. There can only ever be one
        // abortController per 1 hook instance.
        const { abortController, isCurrent, finish } = beginRequest(activeRequest);

        if (dreamAnalysis) {
          // Never log the dream text; the backend loads it from the dream log.
          console.log("analyzing dream log", dreamAnalysis.dream_log_id)
        } else {
          console.log("human message is", chatAiInput?.user_message ?? chatAiInput?.category)
        }
        addChatBreadcrumb("message_sent", { request_id: activeRequest, session_id, mode: requestedMode });

        try {
          const response = dreamAnalysis
            ? await analyzeDream(
                { dream_log_id: dreamAnalysis.dream_log_id, session_id, request_id: activeRequest },
                { signal: abortController.signal }
              )
            : await chatSubmit(chatAiInput as ChatAiInput, { signal: abortController.signal })
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
          addChatBreadcrumb("chat_job_submitted", { request_id: activeRequest, session_id, status: response.data?.status });

          // Inline dispatch (local dev) already returns a finished job.
          if (response.data && await settleJob(response.data, activeRequest, requestedMode, isCurrent)) {
            return;
          }
          await pollChatJob(activeRequest, requestedMode, abortController.signal, isCurrent);
        } catch (err) {
          if (isAbortError(err)) {
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
          finish();
        }
    }, [analyzeDream, beginRequest, chatSubmit, pollChatJob, session_id, settleJob, showToastMessage]);

    // Picks up polling for a job the server says is still generating (after
    // a remount or returning from the background). No-op if that request_id
    // is already being polled.
    const resumeJob = useCallback(async (job: ActiveChatJobData) => {
        if (inFlightRequestIdRef.current === job.request_id) {
          return;
        }
        // The server doesn't tell us the job's category; resumed replies are
        // shown as regular chat messages.
        const requestedMode = GENERAL;
        const { abortController, isCurrent, finish } = beginRequest(job.request_id);
        setPendingUserMessage(job.user_message);
        addChatBreadcrumb("chat_job_resumed", { request_id: job.request_id, session_id, status: job.status });

        try {
          await pollChatJob(job.request_id, requestedMode, abortController.signal, isCurrent);
        } finally {
          finish();
        }
    }, [beginRequest, pollChatJob, session_id]);

    // Asks the server whether a reply is being generated for this session and
    // resumes it if so. Failures are breadcrumbed and ignored; the next
    // foreground or remount asks again.
    const resumeActiveJob = useCallback(async () => {
        if (testMode || !session_id || inFlightRequestIdRef.current) {
          return;
        }
        const generationAtStart = requestGenerationRef.current;
        try {
          const response = await getActiveChatJob({ session_id });
          // Something else started (a send, a reset) while we were asking.
          if (requestGenerationRef.current !== generationAtStart || inFlightRequestIdRef.current) {
            return;
          }
          if (!checkIfLambdaResultIsSuccess(response)) {
            addChatBreadcrumb("active_chat_job_check_failed", { session_id, statusCode: response.statusCode });
            return;
          }
          if (response.data) {
            void resumeJob(response.data);
          }
        } catch (err) {
          addChatBreadcrumb("active_chat_job_check_failed", {
            session_id,
            error: err instanceof Error ? err.message : String(err),
          });
        }
    }, [getActiveChatJob, resumeJob, session_id, testMode]);

    // On returning to the foreground: if a job is being polled, poll now
    // instead of waiting out a timer that iOS paused. Returns whether a poll
    // was in progress.
    const wakePolling = useCallback(() => {
        if (!inFlightRequestIdRef.current) {
          return false;
        }
        wakePollRef.current?.();
        return true;
    }, []);

    const fetchMessage: (input: FetchAiMessageInput, requestId?: string) => Promise<void> = testMode
      ? fetchAiMessageTest
      : fetchAiMessageLive;


    return {aiMessage,isAiLoading,aiError,aiMode,aiRequestId,activeRequestId,fetchMessage,reset,resumeJob,resumeActiveJob,wakePolling,pendingUserMessage}
}
