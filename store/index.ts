import { configureStore } from "@reduxjs/toolkit";

import homePageInfoReducer from "@/store/slices/HomePageInfoSlice";

export const store = configureStore({
  reducer: {
    homePageInfo: homePageInfoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
