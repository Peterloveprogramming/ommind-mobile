import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "@/store";

type DailyMoodState = {
  mood: string | null;
  lastFetchedAt: number | null;
};

type DailyAffirmationIntentionState = {
  user_intention: string;
  user_affirmation: string;
};

type SetDailyMoodPayload = {
  mood: string | null;
};

type SetDailyAffirmationIntentionPayload = {
  user_intention: string;
  user_affirmation?: string;
};

export type DailyCheckInInfoState = {
  dailyMood: DailyMoodState;
  dailyAffirmationIntention: DailyAffirmationIntentionState;
};

const initialState: DailyCheckInInfoState = {
  dailyMood: {
    mood: null,
    lastFetchedAt: null,
  },
  dailyAffirmationIntention: {
    user_intention: "",
    user_affirmation: "",
  },
};

const DailyCheckInInfoSlice = createSlice({
  name: "dailyCheckInInfo",
  initialState,
  reducers: {
    setDailyMood: (state, action: PayloadAction<SetDailyMoodPayload>) => {
      state.dailyMood.mood = action.payload.mood;
      state.dailyMood.lastFetchedAt = Date.now();
    },
    clearDailyMood: (state) => {
      state.dailyMood.mood = null;
      state.dailyMood.lastFetchedAt = null;
    },
    setDailyAffirmationIntention: (
      state,
      action: PayloadAction<SetDailyAffirmationIntentionPayload>
    ) => {
      state.dailyAffirmationIntention.user_intention = action.payload.user_intention;
      state.dailyAffirmationIntention.user_affirmation =
        action.payload.user_affirmation ?? "";
    },
    clearsetDailyAffirmationIntention: (state) => {
      state.dailyAffirmationIntention.user_intention = "";
      state.dailyAffirmationIntention.user_affirmation = "";
    },
    clearDailyCheckInInfo: () => initialState,
  },
});

export const getDailyMood = (state: RootState) => state.dailyCheckInInfo.dailyMood;

export const getDailyAffirmationIntention = (state: RootState) =>
  state.dailyCheckInInfo.dailyAffirmationIntention;

export const {
  setDailyMood,
  clearDailyMood,
  setDailyAffirmationIntention,
  clearsetDailyAffirmationIntention,
  clearDailyCheckInInfo,
} = DailyCheckInInfoSlice.actions;

export default DailyCheckInInfoSlice.reducer;
