import { useMessageRatingApi } from "@/api/api";
import { LambdaResult } from "@/api/types";
import { useToast } from "@/context/useToast";
import { checkIfLambdaResultIsSuccess, getLambdaErrorMessage } from "@/utils/helper";
import { useCallback, useState } from "react";
import { AddMessageRatingInput } from "@/api/lambda/useMessageRatingApi/requests";

export default function useMessageRating() {
  const [messageRating, setMessageRating] = useState<LambdaResult.MessageRatingItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    addMessageRating: { addMessageRating },
  } = useMessageRatingApi();
  const { showToastMessage } = useToast();

  const submitMessageRating = useCallback(
    async (input: AddMessageRatingInput) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await addMessageRating(input);
        const isSuccess = checkIfLambdaResultIsSuccess(response);

        if (!isSuccess) {
          const message = getLambdaErrorMessage(response);
          setMessageRating(null);
          setError(message);
          showToastMessage(message, false);
          return null;
        }

        const nextRating = response.data ?? null;
        setMessageRating(nextRating);
        return nextRating;
      } catch (submitError) {
        console.error("Failed to add message rating:", submitError);
        const message = "Unable to submit message rating";
        setMessageRating(null);
        setError(message);
        showToastMessage(message, false);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [addMessageRating, showToastMessage]
  );

  return {
    messageRating,
    isLoading,
    error,
    submitMessageRating,
  };
}
