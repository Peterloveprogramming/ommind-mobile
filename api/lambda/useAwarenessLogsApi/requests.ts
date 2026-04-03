import { useFetch } from "@/api/useFetch";
import { LAMBDA_SERVICE_URL } from "@/constant";
import { LambdaRequest, LambdaResult } from "@/api/types";

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

const useAwarenessLogsLambdaFetch = <T,>() =>
  useFetch<T>({
    url: LAMBDA_SERVICE_URL,
    method: "POST",
    clearUserInfoFromCacheIfUnauthorized: true,
    useAuthFromCache: true,
  });

const getAwarenessLogIdentifierInput = (input: {
  log_id?: AwarenessLogIdentifier;
  id?: AwarenessLogIdentifier;
}) => ({
  ...(input.log_id !== undefined ? { log_id: input.log_id } : {}),
  ...(input.id !== undefined ? { id: input.id } : {}),
});

export const useGetAwarenessLogs = () => {
  const { commonFetch } = useAwarenessLogsLambdaFetch<LambdaResult.GetAwarenessLogsResult>();

  const lambdaConfig: LambdaRequest = {
    route: "get_awareness_logs",
  };

  const getAwarenessLogs = ({ user_id, offset, limit }: GetAwarenessLogsInput = {}) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        ...(user_id !== undefined ? { user_id } : {}),
        ...(typeof offset === "number" ? { offset } : {}),
        ...(typeof limit === "number" ? { limit } : {}),
      },
    });

  return { getAwarenessLogs };
};

export const useGetAwarenessLog = () => {
  const { commonFetch } = useAwarenessLogsLambdaFetch<LambdaResult.GetAwarenessLogResult>();

  const lambdaConfig: LambdaRequest = {
    route: "get_awareness_log",
  };

  const getAwarenessLog = ({ log_id, id }: GetAwarenessLogInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        ...getAwarenessLogIdentifierInput({ log_id, id }),
      },
    });

  return { getAwarenessLog };
};

export const useAddAwarenessLog = () => {
  const { commonFetch } = useAwarenessLogsLambdaFetch<LambdaResult.AddAwarenessLogResult>();

  const lambdaConfig: LambdaRequest = {
    route: "add_awareness_log",
  };

  const addAwarenessLog = ({ user_id, log }: AddAwarenessLogInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        ...(user_id !== undefined ? { user_id } : {}),
        log,
      },
    });

  return { addAwarenessLog };
};

export const useUpdateAwarenessLog = () => {
  const { commonFetch } = useAwarenessLogsLambdaFetch<LambdaResult.UpdateAwarenessLogResult>();

  const lambdaConfig: LambdaRequest = {
    route: "update_awareness_log",
  };

  const updateAwarenessLog = ({ log_id, id, user_id, log }: UpdateAwarenessLogInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        ...getAwarenessLogIdentifierInput({ log_id, id }),
        ...(user_id !== undefined ? { user_id } : {}),
        log,
      },
    });

  return { updateAwarenessLog };
};

export const useDeleteAwarenessLog = () => {
  const { commonFetch } = useAwarenessLogsLambdaFetch<LambdaResult.DeleteAwarenessLogResult>();

  const lambdaConfig: LambdaRequest = {
    route: "delete_awareness_log",
  };

  const deleteAwarenessLog = ({ log_id, id, user_id }: DeleteAwarenessLogInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        ...getAwarenessLogIdentifierInput({ log_id, id }),
        ...(user_id !== undefined ? { user_id } : {}),
      },
    });

  return { deleteAwarenessLog };
};

export const useBulkDeleteAwarenessLogs = () => {
  const { commonFetch } =
    useAwarenessLogsLambdaFetch<LambdaResult.BulkDeleteAwarenessLogsResult>();

  const lambdaConfig: LambdaRequest = {
    route: "bulk_delete_awareness_logs",
  };

  const bulkDeleteAwarenessLogs = ({ log_ids, user_id }: BulkDeleteAwarenessLogsInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        log_ids,
        ...(user_id !== undefined ? { user_id } : {}),
      },
    });

  return { bulkDeleteAwarenessLogs };
};
