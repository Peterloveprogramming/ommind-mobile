import { useDreamLogsApi } from "@/api/api";
import {
  AddDreamLogInput,
  BulkDeleteDreamLogsInput,
  DeleteDreamLogInput,
  GetDreamLogInput,
  UpdateDreamLogInput,
} from "@/api/lambda/useDreamLogsApi/requests";
import { LambdaResult } from "@/api/types";
import { useToast } from "@/context/useToast";
import { checkIfLambdaResultIsSuccess, getLambdaErrorMessage } from "@/utils/helper";
import { useCallback, useState } from "react";

type FetchDreamLogsOptions = {
  userId?: string | number;
  offset?: number;
  limit?: number;
};

const getDreamLogId = (dreamLog: LambdaResult.DreamLogItem | null | undefined) => {
  const id = dreamLog?.id;
  return typeof id === "number" || typeof id === "string" ? id : null;
};

export default function useDreamLogs() {
  const [dreamLogs, setDreamLogs] = useState<LambdaResult.DreamLogItem[]>([]);
  const [dreamLog, setDreamLog] = useState<LambdaResult.DreamLogItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLog, setIsFetchingLog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    getDreamLogs: { getDreamLogs },
    getDreamLog: { getDreamLog },
    addDreamLog: { addDreamLog },
    updateDreamLog: { updateDreamLog },
    deleteDreamLog: { deleteDreamLog },
    bulkDeleteDreamLogs: { bulkDeleteDreamLogs },
  } = useDreamLogsApi();
  const { showToastMessage } = useToast();

  const fetchDreamLogs = useCallback(
    async ({ userId, offset = 0, limit = 10 }: FetchDreamLogsOptions = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getDreamLogs({
          ...(userId !== undefined ? { user_id: userId } : {}),
          offset,
          limit,
        });
        const isSuccess = checkIfLambdaResultIsSuccess(response);

        if (!isSuccess) {
          const message = getLambdaErrorMessage(response);
          setDreamLogs([]);
          setError(message);
          showToastMessage(message, false);
          return [];
        }

        const nextDreamLogs = Array.isArray(response.data) ? response.data : [];
        setDreamLogs(nextDreamLogs);
        return nextDreamLogs;
      } catch (fetchError) {
        console.error("Failed to fetch dream logs:", fetchError);
        const message = "Unable to load dream logs";
        setDreamLogs([]);
        setError(message);
        showToastMessage(message, false);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [getDreamLogs, showToastMessage]
  );

  const fetchDreamLog = useCallback(
    async (input: GetDreamLogInput) => {
      setIsFetchingLog(true);
      setError(null);

      try {
        const response = await getDreamLog(input);
        const isSuccess = checkIfLambdaResultIsSuccess(response);

        if (!isSuccess) {
          const message = getLambdaErrorMessage(response);
          setDreamLog(null);
          setError(message);
          showToastMessage(message, false);
          return null;
        }

        const nextDreamLog = response.data ?? null;
        setDreamLog(nextDreamLog);
        return nextDreamLog;
      } catch (fetchError) {
        console.error("Failed to fetch dream log:", fetchError);
        const message = "Unable to load dream log";
        setDreamLog(null);
        setError(message);
        showToastMessage(message, false);
        return null;
      } finally {
        setIsFetchingLog(false);
      }
    },
    [getDreamLog, showToastMessage]
  );

  const createDreamLog = useCallback(
    async (input: AddDreamLogInput) => {
      setIsCreating(true);
      setError(null);

      try {
        const response = await addDreamLog(input);
        const isSuccess = checkIfLambdaResultIsSuccess(response);

        if (!isSuccess) {
          const message = getLambdaErrorMessage(response);
          setError(message);
          showToastMessage(message, false);
          return null;
        }

        const nextDreamLog = response.data ?? null;
        setDreamLog(nextDreamLog);
        if (nextDreamLog) {
          setDreamLogs((currentDreamLogs) => [nextDreamLog, ...currentDreamLogs]);
        }
        return nextDreamLog;
      } catch (createError) {
        console.error("Failed to create dream log:", createError);
        const message = "Unable to save dream log";
        setError(message);
        showToastMessage(message, false);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [addDreamLog, showToastMessage]
  );

  const updateDreamLogEntry = useCallback(
    async (input: UpdateDreamLogInput) => {
      setIsUpdating(true);
      setError(null);

      try {
        const response = await updateDreamLog(input);
        const isSuccess = checkIfLambdaResultIsSuccess(response);

        if (!isSuccess) {
          const message = getLambdaErrorMessage(response);
          setError(message);
          showToastMessage(message, false);
          return null;
        }

        const nextDreamLog = response.data ?? null;
        setDreamLog(nextDreamLog);
        if (nextDreamLog) {
          const nextDreamLogId = getDreamLogId(nextDreamLog);
          setDreamLogs((currentDreamLogs) =>
            currentDreamLogs.map((currentDreamLog) =>
              getDreamLogId(currentDreamLog) === nextDreamLogId ? nextDreamLog : currentDreamLog
            )
          );
        }
        return nextDreamLog;
      } catch (updateError) {
        console.error("Failed to update dream log:", updateError);
        const message = "Unable to update dream log";
        setError(message);
        showToastMessage(message, false);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [showToastMessage, updateDreamLog]
  );

  const removeDreamLog = useCallback(
    async (input: DeleteDreamLogInput) => {
      setIsDeleting(true);
      setError(null);

      try {
        const response = await deleteDreamLog(input);
        const isSuccess = checkIfLambdaResultIsSuccess(response);

        if (!isSuccess) {
          const message = getLambdaErrorMessage(response);
          setError(message);
          showToastMessage(message, false);
          return false;
        }

        const deletedDreamLogId =
          input.dream_log_id !== undefined ? input.dream_log_id : input.id;
        setDreamLogs((currentDreamLogs) =>
          currentDreamLogs.filter(
            (currentDreamLog) => getDreamLogId(currentDreamLog) !== deletedDreamLogId
          )
        );
        if (getDreamLogId(dreamLog) === deletedDreamLogId) {
          setDreamLog(null);
        }
        return true;
      } catch (deleteError) {
        console.error("Failed to delete dream log:", deleteError);
        const message = "Unable to delete dream log";
        setError(message);
        showToastMessage(message, false);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteDreamLog, dreamLog, showToastMessage]
  );

  const removeDreamLogs = useCallback(
    async ({ log_ids }: BulkDeleteDreamLogsInput) => {
      setIsDeleting(true);
      setError(null);

      try {
        const response = await bulkDeleteDreamLogs({ log_ids });
        const isSuccess = checkIfLambdaResultIsSuccess(response);

        if (!isSuccess) {
          const message = getLambdaErrorMessage(response);
          setError(message);
          showToastMessage(message, false);
          return false;
        }

        const deletedIds = Array.isArray(response.data?.deleted_ids)
          ? response.data.deleted_ids
          : [];
        setDreamLogs((currentDreamLogs) =>
          currentDreamLogs.filter((currentDreamLog) => {
            const currentDreamLogId = getDreamLogId(currentDreamLog);
            return currentDreamLogId === null || !deletedIds.includes(Number(currentDreamLogId));
          })
        );

        if (dreamLog && deletedIds.includes(Number(getDreamLogId(dreamLog)))) {
          setDreamLog(null);
        }

        return true;
      } catch (deleteError) {
        console.error("Failed to bulk delete dream logs:", deleteError);
        const message = "Unable to delete dream logs";
        setError(message);
        showToastMessage(message, false);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [bulkDeleteDreamLogs, dreamLog, showToastMessage]
  );

  return {
    dreamLogs,
    dreamLog,
    isLoading,
    isFetchingLog,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    fetchDreamLogs,
    fetchDreamLog,
    createDreamLog,
    updateDreamLog: updateDreamLogEntry,
    deleteDreamLog: removeDreamLog,
    bulkDeleteDreamLogs: removeDreamLogs,
  };
}
