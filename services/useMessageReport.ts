import { AddMessageReportInput } from "@/api/lambda/useMessageReportApi/requests";
import { useMessageReportApi } from "@/api/api";
import { LambdaResult } from "@/api/types";
import { useToast } from "@/context/useToast";
import { checkIfLambdaResultIsSuccess, getLambdaErrorMessage } from "@/utils/helper";
import { useCallback, useState } from "react";

export default function useMessageReport() {
  const [messageReport, setMessageReport] = useState<LambdaResult.MessageReportItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    addMessageReport: { addMessageReport },
  } = useMessageReportApi();
  const { showToastMessage } = useToast();

  const submitMessageReport = useCallback(
    async (input: AddMessageReportInput) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await addMessageReport(input);
        const isSuccess = checkIfLambdaResultIsSuccess(response);

        if (!isSuccess) {
          const message = getLambdaErrorMessage(response);
          setMessageReport(null);
          setError(message);
          showToastMessage(message, false);
          return null;
        }

        const nextReport = response.data ?? null;
        setMessageReport(nextReport);
        return nextReport;
      } catch (submitError) {
        console.error("Failed to add message report:", submitError);
        const message = "Unable to submit message report";
        setMessageReport(null);
        setError(message);
        showToastMessage(message, false);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [addMessageReport, showToastMessage]
  );

  return {
    messageReport,
    isLoading,
    error,
    submitMessageReport,
  };
}
