import * as Sentry from "@sentry/react-native";

export type CourseSessionAudioTelemetryData = Record<
  string,
  string | number | boolean | null | undefined
>;

export type CourseSessionAudioTelemetryTags = Record<string, string | undefined>;

export const roundCourseAudioSeconds = (value?: number | null) =>
  Math.round((value || 0) * 100) / 100;

const truncateTelemetryString = (value: string, maxLength = 240) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

const getXmlTagValue = (xml: string, tagName: string) => {
  const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, "i"));
  if (!match?.[1]) {
    return undefined;
  }

  return truncateTelemetryString(match[1].replace(/\s+/g, " ").trim());
};

const getCredentialScope = (credential: string | null) => {
  if (!credential) {
    return null;
  }

  const credentialParts = credential.split("/");
  return credentialParts.length > 1 ? credentialParts.slice(1).join("/") : null;
};

export const sanitizeCourseAudioUrl = (
  prefix: "voice" | "bgm",
  url?: string | null
): CourseSessionAudioTelemetryData => {
  if (!url) {
    return {
      [`${prefix}UrlPresent`]: false,
    };
  }

  try {
    const parsedUrl = new URL(url);

    return {
      [`${prefix}UrlPresent`]: true,
      [`${prefix}UrlProtocol`]: parsedUrl.protocol,
      [`${prefix}UrlHost`]: parsedUrl.host,
      [`${prefix}UrlPath`]: parsedUrl.pathname,
      [`${prefix}UrlHasQuery`]: parsedUrl.search.length > 0,
      [`${prefix}UrlAlgorithm`]: parsedUrl.searchParams.get("X-Amz-Algorithm"),
      [`${prefix}UrlCredentialScope`]: getCredentialScope(
        parsedUrl.searchParams.get("X-Amz-Credential")
      ),
      [`${prefix}UrlExpiresSeconds`]: parsedUrl.searchParams.get("X-Amz-Expires"),
      [`${prefix}UrlAmzDate`]: parsedUrl.searchParams.get("X-Amz-Date"),
      [`${prefix}UrlSignedHeaders`]: parsedUrl.searchParams.get("X-Amz-SignedHeaders"),
      [`${prefix}UrlHasSignature`]: parsedUrl.searchParams.has("X-Amz-Signature"),
      [`${prefix}UrlHasSecurityToken`]: parsedUrl.searchParams.has("X-Amz-Security-Token"),
    };
  } catch {
    return {
      [`${prefix}UrlPresent`]: true,
      [`${prefix}UrlParseFailed`]: true,
    };
  }
};

const readFailedProbeError = async (
  response: Response
): Promise<CourseSessionAudioTelemetryData> => {
  try {
    const responseText = await response.text();

    return {
      probeErrorCode: getXmlTagValue(responseText, "Code"),
      probeErrorMessage: getXmlTagValue(responseText, "Message"),
      probeServerTime: getXmlTagValue(responseText, "ServerTime"),
    };
  } catch (error) {
    return {
      probeErrorReadError: error instanceof Error ? error.message : String(error),
    };
  }
};

export const probeCourseAudioUrl = async (
  url: string
): Promise<CourseSessionAudioTelemetryData> => {
  const startedAtMs = Date.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Range: "bytes=0-1",
      },
    });
    const failedProbeError = response.ok ? {} : await readFailedProbeError(response);

    return {
      probeOk: response.ok,
      probeStatus: response.status,
      probeElapsedMs: Date.now() - startedAtMs,
      probeResponseDate: response.headers.get("date"),
      probeRequestId: response.headers.get("x-amz-request-id"),
      probeContentType: response.headers.get("content-type"),
      probeContentLength: response.headers.get("content-length"),
      probeContentRange: response.headers.get("content-range"),
      probeAcceptRanges: response.headers.get("accept-ranges"),
      ...failedProbeError,
    };
  } catch (error) {
    return {
      probeOk: false,
      probeElapsedMs: Date.now() - startedAtMs,
      probeError: error instanceof Error ? error.message : String(error),
    };
  }
};

export const setCourseSessionAudioContext = (
  data: CourseSessionAudioTelemetryData | null
) => {
  Sentry.setContext("course_session_player", data);
};

export const addCourseSessionAudioBreadcrumb = (
  message: string,
  data: CourseSessionAudioTelemetryData = {}
) => {
  console.log(`[CourseSessionPlayer] ${message}`, data);
  Sentry.addBreadcrumb({
    category: "course_session_audio",
    message,
    level: "info",
    data,
  });
};

export const captureCourseSessionAudioWarning = (
  message: string,
  data: CourseSessionAudioTelemetryData = {},
  tags: CourseSessionAudioTelemetryTags = {}
) => {
  console.warn(`[CourseSessionPlayer] ${message}`, data);
  Sentry.captureMessage(`[CourseSessionPlayer] ${message}`, {
    level: "warning",
    tags: {
      feature: "course_session_audio",
      ...tags,
    },
    extra: data,
  });
};

const toError = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error) {
    return error;
  }

  return new Error(`${fallbackMessage}: ${String(error)}`);
};

export const captureCourseSessionAudioException = (
  message: string,
  error: unknown,
  data: CourseSessionAudioTelemetryData = {},
  tags: CourseSessionAudioTelemetryTags = {}
) => {
  const payload = {
    ...data,
    originalError: error instanceof Error ? error.message : String(error),
  };

  console.error(`[CourseSessionPlayer] ${message}`, payload, error);
  Sentry.captureException(toError(error, message), {
    tags: {
      feature: "course_session_audio",
      ...tags,
    },
    extra: payload,
  });
};
