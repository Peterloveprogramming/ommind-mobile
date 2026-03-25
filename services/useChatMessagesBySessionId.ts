import { useChatMessagesApi } from "@/api/api";
import { LambdaResult } from "@/api/types";
import { useToast } from "@/context/useToast";
import { checkIfLambdaResultIsSuccess, getLambdaErrorMessage } from "@/utils/helper";
import { useCallback, useState } from "react";

type FetchChatMessagesOptions = {
  sessionId: string;
  offset?: number;
  limit?: number;
};

export default function useChatMessagesBySessionId() {
  const [chatMessages, setChatMessages] = useState<LambdaResult.ChatMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    getChatMessagesBySessionId: { getChatMessagesBySessionId },
  } = useChatMessagesApi();
  const { showToastMessage } = useToast();

  const fetchChatMessages = useCallback(
    async ({ sessionId, offset = 0, limit = 50 }: FetchChatMessagesOptions) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getChatMessagesBySessionId({
          session_id: sessionId,
          offset,
          limit,
        });
        const isSuccess = checkIfLambdaResultIsSuccess(response);

        if (!isSuccess) {
          const message = getLambdaErrorMessage(response);
          setChatMessages([]);
          setError(message);
          showToastMessage(message, false);
          return [];
        }

        const nextMessages = Array.isArray(response.data) ? response.data : [];
        setChatMessages(nextMessages);
        return nextMessages;
      } catch (fetchError) {
        console.error("Failed to fetch chat messages:", fetchError);
        const message = "Unable to load chat messages";
        setChatMessages([]);
        setError(message);
        showToastMessage(message, false);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [getChatMessagesBySessionId, showToastMessage]
  );

  return {
    chatMessages,
    isLoading,
    error,
    fetchChatMessages,
  };
}
