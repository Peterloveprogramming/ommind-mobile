import { LambdaResult } from "@/api/types";

export type AwarenessLogIdentifier = string | number;

export type GetAwarenessLogsInput = {
  user_id?: string | number;
  offset?: number;
  limit?: number;
};

export type GetAwarenessLogInput = {
  log_id?: AwarenessLogIdentifier;
  id?: AwarenessLogIdentifier;
};

export type AddAwarenessLogInput = {
  user_id?: string | number;
  log: string;
};

export type UpdateAwarenessLogInput = {
  log_id?: AwarenessLogIdentifier;
  id?: AwarenessLogIdentifier;
  user_id?: string | number;
  log: string;
};

export type DeleteAwarenessLogInput = {
  log_id?: AwarenessLogIdentifier;
  id?: AwarenessLogIdentifier;
  user_id?: string | number;
};

export type BulkDeleteAwarenessLogsInput = {
  log_ids: AwarenessLogIdentifier[];
  user_id?: string | number;
};

export type AnalyzeAwarenessInput = {
  logs_id: AwarenessLogIdentifier[];
  user_id?: string | number;
};

export type AwarenessLogItem = {
  id?: number;
  log_id?: number;
  user_id?: number;
  log?: string | null;
  title?: string | null;
  content?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type GetAwarenessLogsResult = LambdaResult<AwarenessLogItem[]>;
export type GetAwarenessLogResult = LambdaResult<AwarenessLogItem | null>;
export type AddAwarenessLogResult = LambdaResult<AwarenessLogItem | null>;
export type UpdateAwarenessLogResult = LambdaResult<AwarenessLogItem | null>;
export type DeleteAwarenessLogResult = LambdaResult<{ id?: number; log_id?: number } | null>;
export type BulkDeleteAwarenessLogsResult = LambdaResult<{
  deleted_ids?: number[];
  deleted_count?: number;
} | null>;
export type AnalyzeAwarenessResult = LambdaResult<{
  feedback?: string;
  session_id?: string;
  saved_chat_message?: unknown;
  missing_log_ids?: number[];
  [key: string]: unknown;
} | null>;
