import { useDreamLogsApi } from "@/api/api";
import { LambdaResult } from "@/api/types";
import { useToast } from "@/context/useToast";
import { checkIfLambdaResultIsSuccess, getLambdaErrorMessage } from "@/utils/helper";
import { useCallback, useState } from "react";

type FetchDreamLogsOptions = {
  userId: string | number;
  offset?: number;
  limit?: number;
};

export default function useDreamLogs() {
  const [dreamLogs, setDreamLogs] = useState<LambdaResult.DreamLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    getDreamLogs: { getDreamLogs },
  } = useDreamLogsApi();
  const { showToastMessage } = useToast();

  const fetchDreamLogs = useCallback(
    async ({ userId, offset = 0, limit = 10 }: FetchDreamLogsOptions) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getDreamLogs({
          user_id: userId,
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

  return {
    dreamLogs,
    isLoading,
    error,
    fetchDreamLogs,
  };
}
