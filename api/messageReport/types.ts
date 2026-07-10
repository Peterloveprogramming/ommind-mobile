import { LambdaResult } from "@/api/types";

export type AddMessageReportInput = {
  message_id: string | number;
  issues?: string[] | null;
  other_details?: string | null;
};

export type MessageReportItem = {
  id?: number;
  user_id?: number;
  message_id?: number;
  issues?: string[] | null;
  other_details?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type AddMessageReportResult = LambdaResult<MessageReportItem | null>;
