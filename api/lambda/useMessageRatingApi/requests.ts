import { useFetch } from "@/api/useFetch";
import { LAMBDA_SERVICE_URL } from "@/constant";
import { LambdaRequest, LambdaResult } from "@/api/types";

export type AddMessageRatingInput = {
  message_id: string | number;
  session_id: string | number;
  rating: number;
  helpfulness?: number | null;
  accuracy?: number | null;
  clarity?: number | null;
  tone?: number | null;
  issues?: string[] | null;
  other_details?: string | null;
};

export const useAddMessageRating = () => {
  const { commonFetch } = useFetch<LambdaResult.AddMessageRatingResult>({
    url: LAMBDA_SERVICE_URL,
    method: "POST",
    clearUserInfoFromCacheIfUnauthorized: false,
    useAuthFromCache: true,
  });

  const lambdaConfig: LambdaRequest = {
    route: "add_message_rating",
  };

  const addMessageRating = ({
    message_id,
    session_id,
    rating,
    helpfulness = null,
    accuracy = null,
    clarity = null,
    tone = null,
    issues = null,
    other_details = null,
  }: AddMessageRatingInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        message_id,
        session_id,
        rating,
        helpfulness,
        accuracy,
        clarity,
        tone,
        issues,
        other_details,
      },
    });

  return { addMessageRating };
};
