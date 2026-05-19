import { LAMBDA_SERVICE_URL } from "@/constant";
import { LambdaRequest, LambdaResult } from "@/api/types";
import { buildLambdaRequestPayload } from "@/utils/requestContext";

type JwtValidRequest = {
  jwt_token: string;
};

export const validateJwtToken = async (
  jwtToken: string
): Promise<LambdaResult | null> => {
  const lambdaConfig: LambdaRequest = {
    route: "jwt_valid",
  };

  try {
    const requestBody = await buildLambdaRequestPayload({
      ...lambdaConfig,
      jwt_token: jwtToken,
    });

    const response = await fetch(LAMBDA_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody as JwtValidRequest & LambdaRequest),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as LambdaResult;
  } catch (error) {
    console.error("Error validating jwt token:", error);
    return null;
  }
};
