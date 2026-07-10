import { LambdaResult } from "@/api/types";
import { ChatMessageItem } from "@/api/chatMessages/types";

export type ChatAiInput = {
    "session_id":string,
    "question":string,
}

export type ChatResult = LambdaResult<ChatMessageItem, ChatMessageItem> & {
    mode?: string | null;
};
