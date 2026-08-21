export type FavouriteValue = 0 | 1;

export type SessionMetadata = {
  favourite?: FavouriteValue | null;
  message_id?: number | null;
};

export type SessionPlayerRouteParams = {
  image_url?: string | string[];
  backgroundUrl?: string | string[];
  title?: string | string[];
  session_titles?: string | string[];
  session_metadata?: string | string[];
  type?: string | string[];
  favourite?: string | string[];
  course_uuid?: string | string[];
  course_number?: string | string[];
  session_number?: string | string[];
  progress?: string | string[];
  is_generated?: string | string[];
  is_genrated?: string | string[];
  message_id?: string | string[];
};

type BaseSessionPlayerParams = {
  backgroundUrl?: string;
  imageUrl?: string;
  title?: string;
  favourite: FavouriteValue;
  messageId?: string;
};

export type GeneratedSessionPlayerParams = BaseSessionPlayerParams & {
  kind: "generated";
};

export type CourseSessionPlayerParams = BaseSessionPlayerParams & {
  kind: "course";
  meditationType?: string;
  courseUuid?: string;
  courseNumber: number;
  sessionNumber: number;
  initialProgress: number;
  sessionTitlesParam?: string;
  sessionMetadataParam?: string;
  sessionTitles: Record<string, string>;
  sessionMetadata: Record<string, SessionMetadata>;
};

export type ParsedSessionPlayerParams =
  | GeneratedSessionPlayerParams
  | CourseSessionPlayerParams;

const getSingleParam = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const parseFavouriteParam = (
  value?: string,
  fallback: FavouriteValue = 0
): FavouriteValue => {
  if (value === "1" || value === "true") {
    return 1;
  }

  if (value === "0" || value === "false") {
    return 0;
  }

  return fallback;
};

const parseSessionTitles = (value?: string): Record<string, string> => {
  if (!value) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(value);
    return typeof parsedValue === "object" && parsedValue !== null
      ? (parsedValue as Record<string, string>)
      : {};
  } catch {
    return {};
  }
};

const parseSessionMetadata = (value?: string): Record<string, SessionMetadata> => {
  if (!value) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(value);
    return typeof parsedValue === "object" && parsedValue !== null
      ? (parsedValue as Record<string, SessionMetadata>)
      : {};
  } catch {
    return {};
  }
};

export const parseSessionPlayerParams = (
  params: SessionPlayerRouteParams
): ParsedSessionPlayerParams => {
  const backgroundUrl = getSingleParam(params.backgroundUrl);
  const imageUrl = getSingleParam(params.image_url);
  const fallbackTitle = getSingleParam(params.title);
  const sessionTitlesParam = getSingleParam(params.session_titles);
  const sessionMetadataParam = getSingleParam(params.session_metadata);
  const meditationType = getSingleParam(params.type);
  const courseUuid = getSingleParam(params.course_uuid);
  const generatedParam =
    getSingleParam(params.is_generated) ?? getSingleParam(params.is_genrated);
  const isGenerated = generatedParam === "1" || generatedParam === "true";
  const courseNumber = Number(getSingleParam(params.course_number));
  const sessionNumber = Number(getSingleParam(params.session_number));
  const sessionMetadata = parseSessionMetadata(sessionMetadataParam);
  const currentSessionMetadata = sessionMetadata[String(sessionNumber)];
  const messageId =
    getSingleParam(params.message_id) ||
    (currentSessionMetadata?.message_id == null
      ? undefined
      : String(currentSessionMetadata.message_id));
  const favourite = parseFavouriteParam(
    getSingleParam(params.favourite),
    currentSessionMetadata?.favourite ?? 0
  );
  const sessionTitles = parseSessionTitles(sessionTitlesParam);
  const title = sessionTitles[String(sessionNumber)] ?? fallbackTitle;

  if (isGenerated) {
    return {
      kind: "generated",
      backgroundUrl,
      imageUrl,
      title,
      favourite,
      messageId,
    };
  }

  return {
    kind: "course",
    backgroundUrl,
    imageUrl,
    title,
    favourite,
    messageId,
    meditationType,
    courseUuid,
    courseNumber,
    sessionNumber,
    initialProgress: Number(getSingleParam(params.progress) ?? 0),
    sessionTitlesParam,
    sessionMetadataParam,
    sessionTitles,
    sessionMetadata,
  };
};
