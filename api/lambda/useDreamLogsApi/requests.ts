import { useFetch } from "@/api/useFetch";
import { LAMBDA_SERVICE_URL } from "@/constant";
import { LambdaRequest, LambdaResult } from "@/api/types";

export type DreamLogIdentifier = string | number;

export type DreamLogContextInput = {
  dream_time?: string | null;
  waking_feeling?: string | null;
  recurrence?: string | null;
  recent_life_connection?: string | null;
  stress_level?: string | null;
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

export type AnalyzeDreamInput = {
  logs_id: DreamLogIdentifier[];
  user_id?: string | number;
};

const useDreamLogsLambdaFetch = <T,>() =>
  useFetch<T>({
    url: LAMBDA_SERVICE_URL,
    method: "POST",
    clearUserInfoFromCacheIfUnauthorized: true,
    useAuthFromCache: true,
  });

const getDreamLogIdentifierInput = (input: {
  log_id?: DreamLogIdentifier;
  dream_log_id?: DreamLogIdentifier;
  id?: DreamLogIdentifier;
}) => {
  const logId = input.log_id ?? input.dream_log_id ?? input.id;

  return {
    ...(logId !== undefined ? { log_id: logId } : {}),
    ...(input.dream_log_id !== undefined ? { dream_log_id: input.dream_log_id } : {}),
    ...(input.id !== undefined ? { id: input.id } : {}),
  };
};

export const useGetDreamLogs = () => {
  const { commonFetch } = useDreamLogsLambdaFetch<LambdaResult.GetDreamLogsResult>();

  const lambdaConfig: LambdaRequest = {
    route: "get_dream_logs",
  };

  const getDreamLogs = ({ user_id, offset, limit }: GetDreamLogsInput = {}) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        ...(user_id !== undefined ? { user_id } : {}),
        ...(typeof offset === "number" ? { offset } : {}),
        ...(typeof limit === "number" ? { limit } : {}),
      },
    });

  return { getDreamLogs };
};

export const useGetDreamLog = () => {
  const { commonFetch } = useDreamLogsLambdaFetch<LambdaResult.GetDreamLogResult>();

  const lambdaConfig: LambdaRequest = {
    route: "get_dream_log",
  };

  const getDreamLog = ({ log_id, dream_log_id, id }: GetDreamLogInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        ...getDreamLogIdentifierInput({ log_id, dream_log_id, id }),
      },
    });

  return { getDreamLog };
};

export const useAddDreamLog = () => {
  const { commonFetch } = useDreamLogsLambdaFetch<LambdaResult.AddDreamLogResult>();

  const lambdaConfig: LambdaRequest = {
    route: "add_dream_log",
  };

  const addDreamLog = ({ user_id, log, ...dreamContext }: AddDreamLogInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        ...(user_id !== undefined ? { user_id } : {}),
        log,
        ...dreamContext,
      },
    });

  return { addDreamLog };
};

export const useUpdateDreamLog = () => {
  const { commonFetch } = useDreamLogsLambdaFetch<LambdaResult.UpdateDreamLogResult>();

  const lambdaConfig: LambdaRequest = {
    route: "update_dream_log",
  };

  const updateDreamLog = ({ log_id, dream_log_id, id, log, ...dreamContext }: UpdateDreamLogInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        ...getDreamLogIdentifierInput({ log_id, dream_log_id, id }),
        log,
        ...dreamContext,
      },
    });

  return { updateDreamLog };
};

export const useDeleteDreamLog = () => {
  const { commonFetch } = useDreamLogsLambdaFetch<LambdaResult.DeleteDreamLogResult>();

  const lambdaConfig: LambdaRequest = {
    route: "delete_dream_log",
  };

  const deleteDreamLog = ({ log_id, dream_log_id, id }: DeleteDreamLogInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        ...getDreamLogIdentifierInput({ log_id, dream_log_id, id }),
      },
    });

  return { deleteDreamLog };
};

export const useBulkDeleteDreamLogs = () => {
  const { commonFetch } = useDreamLogsLambdaFetch<LambdaResult.BulkDeleteDreamLogsResult>();

  const lambdaConfig: LambdaRequest = {
    route: "bulk_delete_dream_logs",
  };

  const bulkDeleteDreamLogs = ({ log_ids }: BulkDeleteDreamLogsInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        log_ids,
      },
    });

  return { bulkDeleteDreamLogs };
};

export const useAnalyzeDream = () => {
  const { commonFetch } = useDreamLogsLambdaFetch<LambdaResult.AnalyzeDreamResult>();

  const lambdaConfig: LambdaRequest = {
    route: "analyze_dream",
  };

  const analyzeDream = ({ logs_id, user_id }: AnalyzeDreamInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        logs_id,
        ...(user_id !== undefined ? { user_id } : {}),
      },
    });

  return { analyzeDream };
};
