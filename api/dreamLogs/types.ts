import { LambdaResult } from "@/api/types";

export type DreamLogIdentifier = string | number;

export type DreamLogContextInput = {
  dream_time?: string | null;
  waking_feeling?: string | null;
  recurrence?: string | null;
  recent_life_connection?: string | null;
  stress_level?: string | null;
  sleep_quality?: string | null;
  season?: string | null;
  body_sensation_after_waking?: string | null;
  health_or_wellness_context?: string | null;
};

export type GetDreamLogsInput = {
  user_id?: string | number;
  offset?: number;
  limit?: number;
};

export type GetDreamLogInput = {
  log_id?: DreamLogIdentifier;
  dream_log_id?: DreamLogIdentifier;
  id?: DreamLogIdentifier;
};

export type AddDreamLogInput = {
  user_id?: string | number;
  log: string;
} & DreamLogContextInput;

export type UpdateDreamLogInput = {
  log_id?: DreamLogIdentifier;
  dream_log_id?: DreamLogIdentifier;
  id?: DreamLogIdentifier;
  log: string;
} & DreamLogContextInput;

export type DeleteDreamLogInput = {
  log_id?: DreamLogIdentifier;
  dream_log_id?: DreamLogIdentifier;
  id?: DreamLogIdentifier;
};

export type BulkDeleteDreamLogsInput = {
  log_ids: DreamLogIdentifier[];
};

export type DreamLogItem = {
  id?: number;
  user_id?: number;
  log?: string | null;
  title?: string | null;
  content?: string | null;
  interpretation?: string | null;
  dream_time?: string | null;
  waking_feeling?: string | null;
  recurrence?: string | null;
  recent_life_connection?: string | null;
  stress_level?: string | null;
  sleep_quality?: string | null;
  season?: string | null;
  body_sensation_after_waking?: string | null;
  health_or_wellness_context?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type GetDreamLogsResult = LambdaResult<DreamLogItem[]>;
export type GetDreamLogResult = LambdaResult<DreamLogItem | null>;
export type AddDreamLogResult = LambdaResult<DreamLogItem | null>;
export type UpdateDreamLogResult = LambdaResult<DreamLogItem | null>;
export type DeleteDreamLogResult = LambdaResult<DreamLogItem | null>;
export type BulkDeleteDreamLogsResult = LambdaResult<{
  deleted_ids?: number[];
  deleted_count?: number;
} | null>;
