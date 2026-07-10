import { useFetch } from "@/api/useFetch";
import { LAMBDA_SERVICE_URL } from "@/constant";
import { LambdaRequest } from "@/api/types";
import { GetChatHistoryResult } from "./types";

export const useGetChatHistory = () => {
  const { commonFetch } = useFetch<GetChatHistoryResult>({
    url: LAMBDA_SERVICE_URL,
    method: "POST",
    clearUserInfoFromCacheIfUnauthorized: true,
    useAuthFromCache: true,
  });

  const lambdaConfig: LambdaRequest = {
    route: "get_chat_history",
  };

  const getChatHistory = () =>
    commonFetch({
      input: {
        ...lambdaConfig,
      },
    });

  return { getChatHistory };
};
