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

export type ChatResponseData = {
    id: number;
    session_id: string;
    content: string;
    role: "ai" | string;
    request_id?: string;
};

export type ChatResult = LambdaResult<ChatResponseData>;
