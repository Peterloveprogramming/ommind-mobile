import { useFetch } from "@/api/useFetch";
import { LAMBDA_SERVICE_URL } from "@/constant";
import { LambdaRequest, LambdaResult } from "@/api/types";

type GetChatMessagesBySessionIdInput = {
  session_id: string;
  offset?: number;
  limit?: number;
};

export const useGetChatMessagesBySessionId = () => {
  const { commonFetch } = useFetch<LambdaResult.GetChatMessagesBySessionIdResult>({
    url: LAMBDA_SERVICE_URL,
    method: "POST",
    clearUserInfoFromCacheIfUnauthorized: true,
    useAuthFromCache: true,
  });

  const lambdaConfig: LambdaRequest = {
    route: "get_chat_messages_by_session_id",
  };

  const getChatMessagesBySessionId = ({
    session_id,
    offset,
    limit,
  }: GetChatMessagesBySessionIdInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        session_id,
        ...(typeof offset === "number" ? { offset } : {}),
        ...(typeof limit === "number" ? { limit } : {}),
      },
    });

  return { getChatMessagesBySessionId };
};
