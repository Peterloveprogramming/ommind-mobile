import type { ImageSourcePropType } from "react-native";
import type { DreamLogContextInput } from "@/api/dreamLogs/types";

export type DreamDetailKey =
  | "dreamTime"
  | "wakingFeeling"
  | "recurrence"
  | "recentLifeConnection"
  | "stressLevel"
  | "sleepQuality"
  | "season"
  | "bodySensationAfterWaking"
  | "healthOrWellnessContext";

export type DreamDetailApiKey = keyof Required<DreamLogContextInput>;

type DreamDetailSectionBase = {
  key: DreamDetailKey;
  apiKey: DreamDetailApiKey;
  title: string;
  icon: ImageSourcePropType;
  iconSize: number;
  iconResizeMode?: "cover" | "contain";
  headerGap?: number;
};

export type DreamDetailChipSection = DreamDetailSectionBase & {
  kind: "chips";
  options: string[];
};

export type DreamDetailTextSection = DreamDetailSectionBase & {
  kind: "text";
  placeholder: string;
};

export type DreamDetailSection = DreamDetailChipSection | DreamDetailTextSection;

export type DreamDetailValues = Record<DreamDetailKey, string | null>;

export type DreamLogPayload = { log: string } & Record<DreamDetailApiKey, string | null>;

export const DREAM_DETAIL_TEXT_MAX_LENGTH = 256;

// Figma "Optional details" groups (3128:10018), in display order.
export const DREAM_DETAIL_SECTIONS: DreamDetailSection[] = [
  {
    key: "dreamTime",
    apiKey: "dream_time",
    title: "Dream time",
    icon: require("@/assets/images/journal/dream_time.png"),
    iconSize: 14,
    kind: "chips",
    options: ["Early night", "Middle of the night", "Early morning", "After 7am", "Not sure"],
  },
  {
    key: "wakingFeeling",
    apiKey: "waking_feeling",
    title: "Waking feeling",
    icon: require("@/assets/images/journal/waking_feeling.png"),
    iconSize: 14,
    kind: "chips",
    options: ["Pleasant", "Unpleasant", "Neutral", "Mixed", "Not sure"],
  },
  {
    key: "recurrence",
    apiKey: "recurrence",
    title: "Recurring dream?",
    icon: require("@/assets/images/journal/recurring_dream.png"),
    iconSize: 14,
    kind: "chips",
    options: ["First time", "Recurring", "Not sure"],
  },
  {
    key: "recentLifeConnection",
    apiKey: "recent_life_connection",
    title: "Recent life connection",
    icon: require("@/assets/images/journal/recent_life_connection.png"),
    iconSize: 13,
    kind: "chips",
    options: [
      "Work",
      "Relationship",
      "Family",
      "Health",
      "Spiritual practice",
      "Major change",
      "Not sure",
    ],
  },
  {
    key: "stressLevel",
    apiKey: "stress_level",
    title: "Stress level",
    icon: require("@/assets/images/journal/stress_level.png"),
    iconSize: 15,
    kind: "chips",
    options: ["Low", "Medium", "High", "Not sure"],
  },
  {
    key: "sleepQuality",
    apiKey: "sleep_quality",
    title: "Sleep quality",
    icon: require("@/assets/images/journal/sleep_quality.png"),
    iconSize: 13,
    kind: "chips",
    options: ["Good", "Restless", "Interrupted", "Poor", "Not sure"],
  },
  {
    key: "season",
    apiKey: "season",
    title: "Season",
    icon: require("@/assets/images/journal/season.png"),
    iconSize: 16,
    iconResizeMode: "contain",
    headerGap: 5,
    kind: "chips",
    options: ["Spring", "Summer", "Autumn", "Winter", "Transition", "Not sure"],
  },
  {
    key: "bodySensationAfterWaking",
    apiKey: "body_sensation_after_waking",
    title: "Body sensation after waking",
    icon: require("@/assets/images/journal/body_sensation.png"),
    iconSize: 15,
    kind: "text",
    placeholder: "For example: heavy, light, tense, warm, cold, peaceful, unsettled...",
  },
  {
    key: "healthOrWellnessContext",
    apiKey: "health_or_wellness_context",
    title: "Health or wellness context",
    icon: require("@/assets/images/journal/health_context.png"),
    iconSize: 15,
    kind: "text",
    placeholder:
      "Anything you feel is relevant, such as stress, sleep changes, illness, medication, or emotional pressure...",
  },
];

// Stored values from older builds that should select a renamed chip.
const LEGACY_OPTION_ALIASES: Record<string, string> = {
  moderate: "medium",
};

export const cleanDreamDetailValue = (value?: string | null) => {
  const trimmedValue = value?.trim() ?? "";
  return trimmedValue.length > 0 ? trimmedValue : null;
};

/** The chip a stored value selects (case-insensitive, legacy aliases mapped), or null. */
export const getSelectedDreamDetailOption = (
  section: DreamDetailChipSection,
  value: string | null
) => {
  const normalizedValue = cleanDreamDetailValue(value)?.toLowerCase();
  if (!normalizedValue) {
    return null;
  }

  const matchValue = LEGACY_OPTION_ALIASES[normalizedValue] ?? normalizedValue;
  return section.options.find((option) => option.toLowerCase() === matchValue) ?? null;
};

export const hasAnyDreamDetail = (values: DreamDetailValues) =>
  DREAM_DETAIL_SECTIONS.some((section) => cleanDreamDetailValue(values[section.key]) !== null);

/**
 * Body for add/update_dream_log: trimmed text plus all 9 detail keys, with an
 * explicit null for unset ones so the backend clears them.
 */
export const buildDreamLogPayload = (
  entryText: string,
  values: DreamDetailValues
): DreamLogPayload =>
  DREAM_DETAIL_SECTIONS.reduce(
    (payload, section) => ({
      ...payload,
      [section.apiKey]: cleanDreamDetailValue(values[section.key]),
    }),
    { log: entryText.trim() } as DreamLogPayload
  );

export const serializeDreamLogPayload = (payload: DreamLogPayload) => JSON.stringify(payload);
