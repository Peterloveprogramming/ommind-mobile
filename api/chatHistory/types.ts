import { LambdaResult } from "@/api/types";

export type ChatHistoryItem = {
  title: string;
  session_id: string;
  last_message_at?: string | null;
};

export type GetChatHistoryResult = LambdaResult<ChatHistoryItem[]>;
