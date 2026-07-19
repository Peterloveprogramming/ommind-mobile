import { LambdaResult } from "@/api/types";

export type GetChatMessagesBySessionIdInput = {
  session_id: string;
  offset?: number;
  limit?: number;
};

export type GetChatMessageContentByIdInput = {
  message_id: string | number;
};

export type ChatMessageItem = {
  id: number;
  message_id?: number | null;
  session_id: string;
  user_id: number;
  content: string;
  role: string;
  model?: string | null;
  workflow_executed?: string | null;
  classification?: string | null;
  session_title?: string | null;
  favourite?: 0 | 1 | null;
  needs_stage?: string | null;
  needs_categorization_reasoning?: string | null;
  needs_categorization_confidence?: number | null;
  rating?: number | null;
  archived?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

export type GetChatMessagesBySessionIdResult = LambdaResult<ChatMessageItem[]>;
export type GetChatMessageContentByIdResult = LambdaResult<string | { content?: string | null } | null>;
