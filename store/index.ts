import { configureStore } from "@reduxjs/toolkit";

import dailyCheckInInfoReducer from "@/store/slices/DailyCheckInInfoSlice";

export const store = configureStore({
  reducer: {
    dailyCheckInInfo: dailyCheckInInfoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
