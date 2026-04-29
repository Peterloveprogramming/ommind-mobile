import { useChatMessagesApi } from "@/api/api";
import { useToast } from "@/context/useToast";
import { checkIfLambdaResultIsSuccess, getLambdaErrorMessage } from "@/utils/helper";
import { useCallback, useState } from "react";

type FetchChatMessageContentOptions = {
  messageId: string | number;
};

export default function useChatMessageContentById() {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    getChatMessageContentById: { getChatMessageContentById },
  } = useChatMessagesApi();
  const { showToastMessage } = useToast();

  const fetchChatMessageContent = useCallback(
    async ({ messageId }: FetchChatMessageContentOptions) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getChatMessageContentById({
          message_id: messageId,
        });

        if (!checkIfLambdaResultIsSuccess(response)) {
          const message = getLambdaErrorMessage(response);
          setContent(null);
          setError(message);
          showToastMessage(message, false);
          return null;
        }

        const nextContent =
          typeof response.data === "string"
            ? response.data
            : response.data && typeof response.data === "object" && typeof response.data.content === "string"
              ? response.data.content
              : null;
        if (!nextContent) {
          const message = "Unable to load generated meditation";
          setContent(null);
          setError(message);
          showToastMessage(message, false);
          return null;
        }

        setContent(nextContent);
        return nextContent;
      } catch (fetchError) {
        console.error("Failed to fetch chat message content:", fetchError);
        const message = "Unable to load generated meditation";
        setContent(null);
        setError(message);
        showToastMessage(message, false);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [getChatMessageContentById, showToastMessage]
  );

  return {
    content,
    isLoading,
    error,
    fetchChatMessageContent,
  };
}
