import { LambdaResult } from "@/api/types";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const generateRandomNumber = () => {
    return Math.floor(Math.random() * 10000) + 1;
  };



export const convertFieldNameToReadableFormat = (fieldName:string):string => {
  //field name either has the format of first_name or email 
  return fieldName
    .split("_")
    .map(word=>word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const checkIfLambdaResultIsSuccess = <T,>(result: LambdaResult<T> | Record<string, unknown> | null | undefined): boolean => {
  if (!result || typeof result !== "object") return false;
  const statusCode = (result as { statusCode?: number | string }).statusCode;
  if (typeof statusCode === "number") return statusCode >= 200 && statusCode < 300;
  if (typeof statusCode === "string") return statusCode.startsWith("2");
  return false;
};

export const getLambdaErrorMessage = (result: Record<string, unknown> | null | undefined): string => {
  if (!result || typeof result !== "object") return "Unexpected error occurred";

  const response = result.response;
  if (typeof response === "string" && response.trim().length > 0) return response;

  const errorMessage = result.errorMessage;
  if (typeof errorMessage === "string" && errorMessage.trim().length > 0) return errorMessage;

  return "Unexpected error occurred";
};


export const storeAuthInfo = async (authInfo: { userName: string, userId: number,jwtToken:string}) => {
  try {
    // Store the authInfo object by stringifying it
    await AsyncStorage.setItem('authInfo', JSON.stringify(authInfo));
  } catch (e) {
    console.error("Error saving authInfo to AsyncStorage:", e);
  }
};


export const getAuthInfo = async (): Promise<{ userName: string, userId: number,jwtToken:string } | null> => {
  try {
    // Retrieve the authInfo from AsyncStorage and parse it
    const authInfo = await AsyncStorage.getItem('authInfo');
    if (authInfo !== null) {
      return JSON.parse(authInfo); // Return the parsed object
    }
    return null; // If there's no authInfo, return null
  } catch (e) {
    console.error("Error retrieving authInfo from AsyncStorage:", e);
    return null;
  }
};


export const deleteFromCache = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key); // Removes the specified key
    console.log(`${key} has been deleted from AsyncStorage`);
  } catch (e) {
    console.error(`Error removing ${key} from AsyncStorage:`, e);
  }
};


//temporary solution
export const generateUniqueId = () => {
  // Combines the current time in milliseconds with a random string
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
