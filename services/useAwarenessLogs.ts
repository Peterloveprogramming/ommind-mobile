import { useAwarenessLogsApi } from "@/api/api";
import {
  AddAwarenessLogInput,
  DeleteAwarenessLogInput,
  GetAwarenessLogInput,
  UpdateAwarenessLogInput,
} from "@/api/lambda/useAwarenessLogsApi/requests";
import { LambdaResult } from "@/api/types";
import { useToast } from "@/context/useToast";
import { checkIfLambdaResultIsSuccess, getLambdaErrorMessage } from "@/utils/helper";
import { useCallback, useState } from "react";

type FetchAwarenessLogsOptions = {
  userId?: string | number;
  offset?: number;
  limit?: number;
};

const getAwarenessLogId = (awarenessLog: LambdaResult.AwarenessLogItem | null | undefined) => {
  const logId = awarenessLog?.log_id;
  if (typeof logId === "number" || typeof logId === "string") {
    return logId;
  }

  const id = awarenessLog?.id;
  return typeof id === "number" || typeof id === "string" ? id : null;
};

export default function useAwarenessLogs() {
  const [awarenessLogs, setAwarenessLogs] = useState<LambdaResult.AwarenessLogItem[]>([]);
  const [awarenessLog, setAwarenessLog] = useState<LambdaResult.AwarenessLogItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLog, setIsFetchingLog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    getAwarenessLogs: { getAwarenessLogs },
    getAwarenessLog: { getAwarenessLog },
    addAwarenessLog: { addAwarenessLog },
    updateAwarenessLog: { updateAwarenessLog },
    deleteAwarenessLog: { deleteAwarenessLog },
  } = useAwarenessLogsApi();
  const { showToastMessage } = useToast();

  const fetchAwarenessLogs = useCallback(
    async ({ userId, offset = 0, limit = 10 }: FetchAwarenessLogsOptions = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getAwarenessLogs({
          ...(userId !== undefined ? { user_id: userId } : {}),
          offset,
          limit,
        });
        const isSuccess = checkIfLambdaResultIsSuccess(response);

        if (!isSuccess) {
          const message = getLambdaErrorMessage(response);
          setAwarenessLogs([]);
          setError(message);
          showToastMessage(message, false);
          return [];
        }

        const nextAwarenessLogs = Array.isArray(response.data) ? response.data : [];
        setAwarenessLogs(nextAwarenessLogs);
        return nextAwarenessLogs;
      } catch (fetchError) {
        console.error("Failed to fetch awareness logs:", fetchError);
        const message = "Unable to load awareness logs";
        setAwarenessLogs([]);
        setError(message);
        showToastMessage(message, false);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [getAwarenessLogs, showToastMessage]
  );

  const fetchAwarenessLog = useCallback(
    async (input: GetAwarenessLogInput) => {
      setIsFetchingLog(true);
      setError(null);

      try {
        const response = await getAwarenessLog(input);
        const isSuccess = checkIfLambdaResultIsSuccess(response);

        if (!isSuccess) {
          const message = getLambdaErrorMessage(response);
          setAwarenessLog(null);
          setError(message);
          showToastMessage(message, false);
          return null;
        }

        const nextAwarenessLog = response.data ?? null;
        setAwarenessLog(nextAwarenessLog);
        return nextAwarenessLog;
      } catch (fetchError) {
        console.error("Failed to fetch awareness log:", fetchError);
        const message = "Unable to load awareness log";
        setAwarenessLog(null);
        setError(message);
        showToastMessage(message, false);
        return null;
      } finally {
        setIsFetchingLog(false);
      }
    },
    [getAwarenessLog, showToastMessage]
  );

  const createAwarenessLog = useCallback(
    async (input: AddAwarenessLogInput) => {
      setIsCreating(true);
      setError(null);

      try {
        const response = await addAwarenessLog(input);
        const isSuccess = checkIfLambdaResultIsSuccess(response);

        if (!isSuccess) {
          const message = getLambdaErrorMessage(response);
          setError(message);
          showToastMessage(message, false);
          return null;
        }

        const nextAwarenessLog = response.data ?? null;
        setAwarenessLog(nextAwarenessLog);
        if (nextAwarenessLog) {
          setAwarenessLogs((currentAwarenessLogs) => [nextAwarenessLog, ...currentAwarenessLogs]);
        }
        return nextAwarenessLog;
      } catch (createError) {
        console.error("Failed to create awareness log:", createError);
        const message = "Unable to save awareness log";
        setError(message);
        showToastMessage(message, false);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [addAwarenessLog, showToastMessage]
  );

  const updateAwarenessLogEntry = useCallback(
    async (input: UpdateAwarenessLogInput) => {
      setIsUpdating(true);
      setError(null);

      try {
        const response = await updateAwarenessLog(input);
        const isSuccess = checkIfLambdaResultIsSuccess(response);

        if (!isSuccess) {
          const message = getLambdaErrorMessage(response);
          setError(message);
          showToastMessage(message, false);
          return null;
        }

        const nextAwarenessLog = response.data ?? null;
        setAwarenessLog(nextAwarenessLog);
        if (nextAwarenessLog) {
          const nextAwarenessLogId = getAwarenessLogId(nextAwarenessLog);
          setAwarenessLogs((currentAwarenessLogs) =>
            currentAwarenessLogs.map((currentAwarenessLog) =>
              getAwarenessLogId(currentAwarenessLog) === nextAwarenessLogId
                ? nextAwarenessLog
                : currentAwarenessLog
            )
          );
        }
        return nextAwarenessLog;
      } catch (updateError) {
        console.error("Failed to update awareness log:", updateError);
        const message = "Unable to update awareness log";
        setError(message);
        showToastMessage(message, false);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [showToastMessage, updateAwarenessLog]
  );

  const removeAwarenessLog = useCallback(
    async (input: DeleteAwarenessLogInput) => {
      setIsDeleting(true);
      setError(null);

      try {
        const response = await deleteAwarenessLog(input);
        const isSuccess = checkIfLambdaResultIsSuccess(response);

        if (!isSuccess) {
          const message = getLambdaErrorMessage(response);
          setError(message);
          showToastMessage(message, false);
          return false;
        }

        const deletedAwarenessLogId = input.log_id !== undefined ? input.log_id : input.id;
        setAwarenessLogs((currentAwarenessLogs) =>
          currentAwarenessLogs.filter(
            (currentAwarenessLog) => getAwarenessLogId(currentAwarenessLog) !== deletedAwarenessLogId
          )
        );
        if (getAwarenessLogId(awarenessLog) === deletedAwarenessLogId) {
          setAwarenessLog(null);
        }
        return true;
      } catch (deleteError) {
        console.error("Failed to delete awareness log:", deleteError);
        const message = "Unable to delete awareness log";
        setError(message);
        showToastMessage(message, false);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [awarenessLog, deleteAwarenessLog, showToastMessage]
  );

  return {
    awarenessLogs,
    awarenessLog,
    isLoading,
    isFetchingLog,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    fetchAwarenessLogs,
    fetchAwarenessLog,
    createAwarenessLog,
    updateAwarenessLog: updateAwarenessLogEntry,
    deleteAwarenessLog: removeAwarenessLog,
  };
}
