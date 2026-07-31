import { LAMBDA_SERVICE_API_KEY, LAMBDA_SERVICE_URL } from "@/constant";

export const getLambdaServiceHeaders = (
  url: string,
  headers?: RequestInit["headers"]
): RequestInit["headers"] => {
  if (url !== LAMBDA_SERVICE_URL) {
    return headers;
  }

  const nextHeaders = new Headers(headers);
  nextHeaders.set("x-api-key", LAMBDA_SERVICE_API_KEY);
  return nextHeaders;
};
