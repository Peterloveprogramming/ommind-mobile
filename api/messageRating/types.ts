import { LambdaResult } from "@/api/types";

export type AddMessageRatingInput = {
  message_id: string | number;
  session_id: string | number;
  rating: number;
  helpfulness?: number | null;
  accuracy?: number | null;
  clarity?: number | null;
  tone?: number | null;
  issues?: string[] | null;
  other_details?: string | null;
};

export type MessageRatingItem = {
  id?: number;
  user_id?: number;
  message_id?: number;
  session_id?: string;
  rating?: number;
  helpfulness?: number | null;
  accuracy?: number | null;
  clarity?: number | null;
  tone?: number | null;
  issues?: string[] | null;
  other_details?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type AddMessageRatingResult = LambdaResult<MessageRatingItem | null>;
