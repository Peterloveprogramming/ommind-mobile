import { useFetch } from "@/api/useFetch";
import { LAMBDA_SERVICE_URL } from "@/constant";
import { LambdaRequest } from "@/api/types";
import {
  GetDreamLogsInput,
  GetDreamLogInput,
  AddDreamLogInput,
  UpdateDreamLogInput,
  DeleteDreamLogInput,
  BulkDeleteDreamLogsInput,
  GetDreamLogsResult,
  GetDreamLogResult,
  AddDreamLogResult,
  UpdateDreamLogResult,
  DeleteDreamLogResult,
  BulkDeleteDreamLogsResult,
} from "./types";

const useDreamLogsLambdaFetch = <T,>() =>
  useFetch<T>({
    url: LAMBDA_SERVICE_URL,
    method: "POST",
    clearUserInfoFromCacheIfUnauthorized: true,
    useAuthFromCache: true,
  });

const getDreamLogIdentifierInput = (input: {
  log_id?: GetDreamLogInput["log_id"];
  dream_log_id?: GetDreamLogInput["dream_log_id"];
  id?: GetDreamLogInput["id"];
}) => {
  const logId = input.log_id ?? input.dream_log_id ?? input.id;

  return {
    ...(logId !== undefined ? { log_id: logId } : {}),
    ...(input.dream_log_id !== undefined ? { dream_log_id: input.dream_log_id } : {}),
    ...(input.id !== undefined ? { id: input.id } : {}),
  };
};

export const useGetDreamLogs = () => {
  const { commonFetch } = useDreamLogsLambdaFetch<GetDreamLogsResult>();

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
  const { commonFetch } = useDreamLogsLambdaFetch<GetDreamLogResult>();

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
  const { commonFetch } = useDreamLogsLambdaFetch<AddDreamLogResult>();

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
  const { commonFetch } = useDreamLogsLambdaFetch<UpdateDreamLogResult>();

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
  const { commonFetch } = useDreamLogsLambdaFetch<DeleteDreamLogResult>();

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
  const { commonFetch } = useDreamLogsLambdaFetch<BulkDeleteDreamLogsResult>();

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
