import { configureStore } from "@reduxjs/toolkit";

import homePageInfoReducer from "@/store/slices/HomePageInfoSlice";
import meditationReducer from "@/store/slices/MeditationSlice";

export const store = configureStore({
  reducer: {
    homePageInfo: homePageInfoReducer,
    meditation: meditationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
