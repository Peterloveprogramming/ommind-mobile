import { LambdaResult } from "@/api/types";
import { Router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LAMBDA_SERVICE_URL } from "@/constant";
import {
  UpdateSessionProgressInput,
  UpdateSessionProgressResult,
} from "@/api/lambda/meditation/types";

const PROFILE_PHOTO_URI_KEY = "profilePhotoUri";

export type AddRecentlyAccessedSessionInput = {
  course_number?: number | null;
  session_number?: number | null;
  session_length_in_mins?: number | null;
  is_generated: 0 | 1;
  type: string;
  session_title: string;
  image_url?: string | null;
  background_url?: string | null;
  message_id?: number | null;
};

export const generateRandomNumber = () => {
  return Math.floor(Math.random() * 10000) + 1;
};

export const convertFieldNameToReadableFormat = (fieldName: string): string => {
  return fieldName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const checkIfLambdaResultIsSuccess = <T,>(
  result: LambdaResult<T> | Record<string, unknown> | null | undefined
): boolean => {
  if (!result || typeof result !== "object") return false;
  const statusCode = (result as { statusCode?: number | string }).statusCode;
  if (typeof statusCode === "number") return statusCode >= 200 && statusCode < 300;
  if (typeof statusCode === "string") return statusCode.startsWith("2");
  return false;
};

export const getLambdaErrorMessage = (
  result: Record<string, unknown> | null | undefined
): string => {
  if (!result || typeof result !== "object") return "Unexpected error occurred";

  const response = result.response;
  if (typeof response === "string" && response.trim().length > 0) return response;

  const errorMessage = result.errorMessage;
  if (typeof errorMessage === "string" && errorMessage.trim().length > 0) return errorMessage;

  return "Unexpected error occurred";
};

export const storeAuthInfo = async (authInfo: {
  userName: string;
  userId: number;
  jwtToken: string;
}) => {
  try {
    await AsyncStorage.setItem("authInfo", JSON.stringify(authInfo));
  } catch (e) {
    console.error("Error saving authInfo to AsyncStorage:", e);
  }
};

export const getAuthInfo = async (): Promise<{
  userName: string;
  userId: number;
  jwtToken: string;
} | null> => {
  try {
    const authInfo = await AsyncStorage.getItem("authInfo");
    if (authInfo !== null) {
      return JSON.parse(authInfo) as {
        userName: string;
        userId: number;
        jwtToken: string;
      };
    }
    return null;
  } catch (e) {
    console.error("Error retrieving authInfo from AsyncStorage:", e);
    return null;
  }
};

export const storeProfilePhotoUri = async (uri: string) => {
  try {
    await AsyncStorage.setItem(PROFILE_PHOTO_URI_KEY, uri);
  } catch (e) {
    console.error("Error saving profile photo uri to AsyncStorage:", e);
  }
};

export const getProfilePhotoUri = async (): Promise<string | null> => {
  try {
    const profilePic =  await AsyncStorage.getItem(PROFILE_PHOTO_URI_KEY);
    console.log("profilepic",profilePic)
    return profilePic
  } catch (e) {
    console.error("Error retrieving profile photo uri from AsyncStorage:", e);
    return null;
  }
};

export const deleteProfilePhotoUri = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PROFILE_PHOTO_URI_KEY);
  } catch (e) {
    console.error("Error removing profile photo uri from AsyncStorage:", e);
  }
};

export const deleteFromCache = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`${key} has been deleted from AsyncStorage`);
  } catch (e) {
    console.error(`Error removing ${key} from AsyncStorage:`, e);
  }
};

export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const navigateToNewChat = (
  router: Router,
  navigationMethod: "push" | "replace" = "push"
) => {
  router[navigationMethod]({
    pathname: "/chat",
    params: { session_id: generateUniqueId() },
  });
};

export const addRecentlyAccessedSession = async (
  input: AddRecentlyAccessedSessionInput
): Promise<LambdaResult<AddRecentlyAccessedSessionInput & { user_id: number } | null>> => {
  const authInfo = await getAuthInfo();

  if (!authInfo) {
    throw new Error("Cannot add recently accessed session without authInfo");
  }

  const response = await fetch(LAMBDA_SERVICE_URL, {
    method: "POST",
    body: JSON.stringify({
      route: "add_recently_accessed_session",
      jwt_token: authInfo.jwtToken,
      user_id: authInfo.userId,
      ...input,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to add recently accessed session");
  }

  return response.json();
};

export const updateSessionProgress = async (
  input: UpdateSessionProgressInput
): Promise<UpdateSessionProgressResult> => {
  const authInfo = await getAuthInfo();

  if (!authInfo) {
    throw new Error("Cannot update session progress without authInfo");
  }

  const response = await fetch(LAMBDA_SERVICE_URL, {
    method: "POST",
    body: JSON.stringify({
      route: "update_session_progress",
      jwt_token: authInfo.jwtToken,
      user_id: authInfo.userId,
      ...input,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update session progress");
  }

  return response.json();
};
