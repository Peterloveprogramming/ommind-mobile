import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type {
  HomepageInfoData,
  MoodCheckIn,
  RecommendedSession,
} from "@/api/meditation/types";
import type { RootState } from "@/store";
import { DEFAULT_HOME_PAGE_TEXT } from "@/constant";

type DailyMoodState = {
  mood: string | null;
  lastFetchedAt: number | null;
};

type DailyAffirmationIntentionState = {
  user_intention: string;
  user_affirmation: string;
  lastFetchedAt: number | null;
};

type HomePageTextState = {
  text: string | null;
  lastFetchedAt: number | null;
};

type RecommendedSessionState = {
  session: RecommendedSession | null;
  lastFetchedAt: number | null;
};

type MoodCheckInState = {
  value: MoodCheckIn | null;
  lastFetchedAt: number | null;
};

type SetDailyMoodPayload = {
  mood: string | null;
};

type SetDailyAffirmationIntentionPayload = {
  user_intention: string;
  user_affirmation?: string;
};

export type HomePageInfoState = {
  dailyMood: DailyMoodState;
  moodCheckIn: MoodCheckInState;
  dailyAffirmationIntention: DailyAffirmationIntentionState;
  homePageText: HomePageTextState;
  recommendedSession: RecommendedSessionState;
  lastFetchedAt: number | null;
};

const initialState: HomePageInfoState = {
  dailyMood: {
    mood: null,
    lastFetchedAt: null,
  },
  moodCheckIn: {
    value: null,
    lastFetchedAt: null,
  },
  dailyAffirmationIntention: {
    user_intention: "",
    user_affirmation: "",
    lastFetchedAt: null,
  },
  homePageText: {
    text: null,
    lastFetchedAt: null,
  },
  recommendedSession: {
    session: null,
    lastFetchedAt: null,
  },
  lastFetchedAt: null,
};

export const buildHomePageTextFromSessionTitle = (sessionTitle: string | null) => {
  const trimmedTitle = (sessionTitle ?? "").trim();
  const practiceTitle = trimmedTitle.includes(":")
    ? trimmedTitle.split(":", 2)[1]?.trim() ?? ""
    : trimmedTitle;

  if (!practiceTitle) {
    return DEFAULT_HOME_PAGE_TEXT;
  }

  return `Last time, you practiced ${practiceTitle}.\nContinue today?`;
};

const homePageInfoSlice = createSlice({
  name: "homePageInfo",
  initialState,
  reducers: {
    setDailyMood: (state, action: PayloadAction<SetDailyMoodPayload>) => {
      state.dailyMood.mood = action.payload.mood;
      state.dailyMood.lastFetchedAt = Date.now();
    },
    clearDailyMood: (state) => {
      state.dailyMood.mood = null;
      state.dailyMood.lastFetchedAt = null;
      state.moodCheckIn.value = null;
      state.moodCheckIn.lastFetchedAt = null;
    },
    setDailyAffirmationIntention: (
      state,
      action: PayloadAction<SetDailyAffirmationIntentionPayload>
    ) => {
      const fetchedAt = Date.now();
      state.dailyAffirmationIntention.user_intention = action.payload.user_intention;
      state.dailyAffirmationIntention.user_affirmation =
        action.payload.user_affirmation ?? "";
      state.dailyAffirmationIntention.lastFetchedAt = fetchedAt;
    },
    clearsetDailyAffirmationIntention: (state) => {
      state.dailyAffirmationIntention.user_intention = "";
      state.dailyAffirmationIntention.user_affirmation = "";
      state.dailyAffirmationIntention.lastFetchedAt = null;
    },
    setHomePageInfo: (state, action: PayloadAction<HomepageInfoData>) => {
      const fetchedAt = Date.now();
      const {
        home_page_text,
        mood_check_in,
        intention_and_affirmation,
        recommended_session,
      } = action.payload;

      state.lastFetchedAt = fetchedAt;
      state.homePageText.text = home_page_text || DEFAULT_HOME_PAGE_TEXT;
      state.homePageText.lastFetchedAt = fetchedAt;
      state.moodCheckIn.value = mood_check_in;
      state.moodCheckIn.lastFetchedAt = fetchedAt;

      state.dailyMood.mood = mood_check_in?.mood ?? null;
      state.dailyMood.lastFetchedAt = fetchedAt;

      state.dailyAffirmationIntention.user_intention =
        intention_and_affirmation?.intention ?? "";
      state.dailyAffirmationIntention.user_affirmation =
        intention_and_affirmation?.affirmation ?? "";
      state.dailyAffirmationIntention.lastFetchedAt = fetchedAt;

      state.recommendedSession.session = recommended_session;
      state.recommendedSession.lastFetchedAt = fetchedAt;
    },
    setHomePageTextFromSessionTitle: (
      state,
      action: PayloadAction<{ sessionTitle: string | null }>
    ) => {
      state.homePageText.text = buildHomePageTextFromSessionTitle(
        action.payload.sessionTitle
      );
      state.homePageText.lastFetchedAt = Date.now();
    },
    clearRecommendedSession: (state) => {
      state.recommendedSession.session = null;
      state.recommendedSession.lastFetchedAt = null;
    },
    clearHomePageInfo: () => initialState,
  },
});

export const getHomePageInfoState = (state: RootState) => state.homePageInfo;

export const getDailyMood = (state: RootState) => state.homePageInfo.dailyMood;

export const getDailyAffirmationIntention = (state: RootState) =>
  state.homePageInfo.dailyAffirmationIntention;

export const {
  setDailyMood,
  clearDailyMood,
  setDailyAffirmationIntention,
  clearsetDailyAffirmationIntention,
  setHomePageInfo,
  setHomePageTextFromSessionTitle,
  clearRecommendedSession,
  clearHomePageInfo,
} = homePageInfoSlice.actions;

export default homePageInfoSlice.reducer;
