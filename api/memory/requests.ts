import type { LambdaRequest } from "@/api/types";
import { useFetch } from "@/api/useFetch";
import { LAMBDA_SERVICE_URL } from "@/constant";
import type { TriggerMemoryFactsUpdateAgentResult } from "./types";

export const useMemoryApi = () => {
  const { commonFetch } = useFetch<TriggerMemoryFactsUpdateAgentResult>({
    url: LAMBDA_SERVICE_URL,
    method: "POST",
    clearUserInfoFromCacheIfUnauthorized: false,
    useAuthFromCache: true,
  });

  const triggerMemoryFactsUpdateAgent = () => {
    const lambdaConfig: LambdaRequest = {
      route: "trigger_memory_facts_update_agent",
    };

    return commonFetch({
      input: {
        ...lambdaConfig,
      },
    }) as Promise<TriggerMemoryFactsUpdateAgentResult>;
  };

  return {
    triggerMemoryFactsUpdateAgent,
  };
};
