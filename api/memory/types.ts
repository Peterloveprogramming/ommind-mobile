import type { LambdaResult } from "@/api/types";

export type MemoryFactsUpdateStats = {
  fetched?: number;
  processed?: number;
  updated?: number;
  unchanged?: number;
  failed?: number;
  failed_ids?: (number | string)[];
};

export type TriggerMemoryFactsUpdateAgentResult = LambdaResult<MemoryFactsUpdateStats | null>;
