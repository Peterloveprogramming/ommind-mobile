import { useFetch } from "@/api/useFetch";
import { LAMBDA_SERVICE_URL } from "@/constant";
import { LambdaRequest, LambdaResult } from "@/api/types";

export type GetDreamLogsInput = {
  user_id: string | number;
  offset?: number;
  limit?: number;
};

export const useGetDreamLogs = () => {
  const { commonFetch } = useFetch<LambdaResult.GetDreamLogsResult>({
    url: LAMBDA_SERVICE_URL,
    method: "POST",
    clearUserInfoFromCacheIfUnauthorized: true,
    useAuthFromCache: true,
  });

  const lambdaConfig: LambdaRequest = {
    route: "get_dream_logs",
  };

  const getDreamLogs = ({ user_id, offset, limit }: GetDreamLogsInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        user_id,
        ...(typeof offset === "number" ? { offset } : {}),
        ...(typeof limit === "number" ? { limit } : {}),
      },
    });

  return { getDreamLogs };
};
