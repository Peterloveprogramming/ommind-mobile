import { useFetch } from "@/api/useFetch";
import { LAMBDA_SERVICE_URL } from "@/constant";
import { LambdaRequest, LambdaResult } from "@/api/types";

export type AddMessageReportInput = {
  message_id: string | number;
  issues?: string[] | null;
  other_details?: string | null;
};

export const useAddMessageReport = () => {
  const { commonFetch } = useFetch<LambdaResult.AddMessageReportResult>({
    url: LAMBDA_SERVICE_URL,
    method: "POST",
    clearUserInfoFromCacheIfUnauthorized: false,
    useAuthFromCache: true,
  });

  const lambdaConfig: LambdaRequest = {
    route: "add_message_report",
  };

  const addMessageReport = ({
    message_id,
    issues = null,
    other_details = null,
  }: AddMessageReportInput) =>
    commonFetch({
      input: {
        ...lambdaConfig,
        message_id,
        issues,
        other_details,
      },
    });

  return { addMessageReport };
};
