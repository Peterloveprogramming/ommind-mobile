import { useFetch } from "@/api/useFetch";
import { LAMBDA_SERVICE_URL } from "@/constant";
import { LambdaRequest, LambdaResult } from "@/api/types";

export type DreamLogIdentifier = string | number;

export type GetDreamLogsInput = {
  user_id?: string | number;
  offset?: number;
  limit?: number;
};

export type GetDreamLogInput = {
  dream_log_id?: DreamLogIdentifier;
  id?: DreamLogIdentifier;
};

export type AddDreamLogInput = {
  user_id?: string | number;
  log: string;
};

export type UpdateDreamLogInput = {
  dream_log_id?: DreamLogIdentifier;
  id?: DreamLogIdentifier;
  log: string;
};

export type DeleteDreamLogInput = {
  dream_log_id?: DreamLogIdentifier;
  id?: DreamLogIdentifier;
};

const useDreamLogsLambdaFetch = <T,>() =>
  useFetch<T>({
    url: LAMBDA_SERVICE_URL,
    method: "POST",
    clearUserInfoFromCacheIfUnauthorized: true,
    useAuthFromCache: true,
  });

const getDreamLogIdentifierInput = (input: {
  dream_log_id?: DreamLogIdentifier;
  id?: DreamLogIdentifier;
}) => ({
  ...(input.dream_log_id !== undefined ? { dream_log_id: input.dream_log_id } : {}),
  ...(input.id !== undefined ? { id: input.id } : {}),
});

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

  const getDreamLog = ({ dream_log_id, id }: GetDreamLogInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        ...getDreamLogIdentifierInput({ dream_log_id, id }),
      },
    });

  return { getDreamLog };
};

export const useAddDreamLog = () => {
  const { commonFetch } = useDreamLogsLambdaFetch<LambdaResult.AddDreamLogResult>();

  const lambdaConfig: LambdaRequest = {
    route: "add_dream_log",
  };

  const addDreamLog = ({ user_id, log }: AddDreamLogInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        ...(user_id !== undefined ? { user_id } : {}),
        log,
      },
    });

  return { addDreamLog };
};

export const useUpdateDreamLog = () => {
  const { commonFetch } = useDreamLogsLambdaFetch<LambdaResult.UpdateDreamLogResult>();

  const lambdaConfig: LambdaRequest = {
    route: "update_dream_log",
  };

  const updateDreamLog = ({ dream_log_id, id, log }: UpdateDreamLogInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        ...getDreamLogIdentifierInput({ dream_log_id, id }),
        log,
      },
    });

  return { updateDreamLog };
};

export const useDeleteDreamLog = () => {
  const { commonFetch } = useDreamLogsLambdaFetch<LambdaResult.DeleteDreamLogResult>();

  const lambdaConfig: LambdaRequest = {
    route: "delete_dream_log",
  };

  const deleteDreamLog = ({ dream_log_id, id }: DeleteDreamLogInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        ...getDreamLogIdentifierInput({ dream_log_id, id }),
      },
    });

  return { deleteDreamLog };
};
