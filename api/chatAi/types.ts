import { LambdaResult } from "@/api/types";

export type GuidedMeditationWorkflowSpecificInput = {
    focus: string;
    meditation_style: string;
    guided_meditation_length: number;
    notes_from_user?: string | null;
};

export type ChatAiInput = {
    session_id: string;
    user_message?: string;
    category?: "guided_meditation" | "dream";
    workflowSpecificInput?: GuidedMeditationWorkflowSpecificInput;
    // Client-generated id correlating this request to its response and to
    // logging/observability on both mobile and backend.
    request_id?: string;
};

export type ChatAiRequest = Omit<ChatAiInput, "session_id">;

// Dream analysis by dream log id: the backend loads the log text and details.
export type AnalyzeDreamInput = {
    session_id: string;
    dream_log_id: number | string;
    request_id?: string;
};

export type ChatResponseData = {
    id: number;
    session_id: string;
    content: string;
    role: "ai" | string;
    request_id?: string;
};

export type ChatResult = LambdaResult<ChatResponseData>;

export type ChatJobStatus = "queued" | "running" | "succeeded" | "failed";
export type ChatJobData = {
  request_id: string;
  session_id: string;
  status: ChatJobStatus;
  error_code: string | null;
  message: ChatResponseData | null;
};
export type ChatJobResult = LambdaResult<ChatJobData>;
export type ActiveChatJobData = {
  request_id: string;
  session_id: string;
  status: "queued" | "running";
  user_message: string | null;
};
export type ActiveChatJobResult = LambdaResult<ActiveChatJobData | null>;
