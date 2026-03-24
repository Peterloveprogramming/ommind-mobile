import { useChatHistoryApi } from "@/api/api";
import { LambdaResult } from "@/api/types";
import { useToast } from "@/context/useToast";
import { checkIfLambdaResultIsSuccess, getLambdaErrorMessage } from "@/utils/helper";
import { useCallback, useState } from "react";

export default function useChatHistory() {
  const [chatHistories, setChatHistories] = useState<LambdaResult.ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getChatHistory: { getChatHistory } } = useChatHistoryApi();
  const { showToastMessage } = useToast();

  const fetchChatHistories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getChatHistory();
      const isSuccess = checkIfLambdaResultIsSuccess(response);

      if (!isSuccess) {
        const message = getLambdaErrorMessage(response);
        setChatHistories([]);
        setError(message);
        showToastMessage(message, false);
        return;
      }

      setChatHistories(Array.isArray(response.data) ? response.data : []);
    } catch (fetchError) {
      console.error("Failed to fetch chat histories:", fetchError);
      const message = "Unable to load chat histories";
      setChatHistories([]);
      setError(message);
      showToastMessage(message, false);
    } finally {
      setIsLoading(false);
    }
  }, [getChatHistory, showToastMessage]);

  return {
    chatHistories,
    isLoading,
    error,
    fetchChatHistories,
  };
}
