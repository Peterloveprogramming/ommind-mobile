import Constants from "expo-constants";
import { Platform } from "react-native";

const IP_ADDRESS_TIMEOUT_MS = 1500;

let cachedIpAddressPromise: Promise<string> | null = null;

export type RequestMetadata = {
  app_version: string;
  device_type: string;
  ip_address: string;
  os_version: string;
};

type AuthInfoLike = {
  userId: number;
  jwtToken: string;
} | null;

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error("Timed out")), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
};

const fetchIpAddress = async (): Promise<string> => {
  if (!cachedIpAddressPromise) {
    cachedIpAddressPromise = (async () => {
      try {
        const response = await withTimeout(
          fetch("https://api.ipify.org?format=json"),
          IP_ADDRESS_TIMEOUT_MS
        );

        if (!response.ok) {
          return "";
        }

        const data = (await response.json()) as { ip?: unknown };

        return typeof data.ip === "string" ? data.ip : "";
      } catch (error) {
        console.warn("Unable to determine public IP address:", error);
        return "";
      }
    })();
  }

  return cachedIpAddressPromise;
};

export const getRequestMetadata = async (): Promise<RequestMetadata> => {
  const ip_address = await fetchIpAddress();
  const app_version = "";
  const os_version = Platform.OS;
  const device_type =
    Platform.OS === "android"
      ? Platform.constants.Model ?? Constants.deviceName ?? "android"
      : Constants.platform?.ios?.model ?? Constants.deviceName ?? "ios";

  return {
    app_version,
    device_type,
    ip_address,
    os_version,
  };
};

export const buildLambdaRequestPayload = async <T extends Record<string, any>>(
  input: T,
  authInfo: AuthInfoLike = null
): Promise<
  T & RequestMetadata & { action: string; user_id: number | string; jwt_token?: string }
> => {
  const route = typeof input.route === "string" ? input.route : "";
  const needsMetadata =
    input.ip_address === undefined ||
    input.device_type === undefined ||
    input.os_version === undefined ||
    input.app_version === undefined;
  const metadata = needsMetadata ? await getRequestMetadata() : null;

  return {
    ...input,
    route,
    action: typeof input.action === "string" ? input.action : route,
    user_id: input.user_id ?? authInfo?.userId ?? 0,
    ...(input.jwt_token ?? authInfo?.jwtToken
      ? { jwt_token: input.jwt_token ?? authInfo?.jwtToken }
      : {}),
    ip_address: input.ip_address ?? metadata?.ip_address ?? "",
    device_type: input.device_type ?? metadata?.device_type ?? "",
    os_version: input.os_version ?? metadata?.os_version ?? "",
    app_version: input.app_version ?? metadata?.app_version ?? "",
  };
};
