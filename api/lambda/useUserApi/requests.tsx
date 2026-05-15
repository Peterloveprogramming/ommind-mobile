import { useFetch } from "@/api/useFetch";
import {LAMBDA_SERVICE_URL} from "@/constant"
import { LambdaResult,CreateUserInput, LoginUserInput, LambdaRequest} from "../../types";

export type UploadProfilePicInput = {
    image: string;
}

export type UpdateUserCurrentFocusInput = {
    current_focus: string[];
}

export type GetRecentlyAccessedMeditationSessionsInput = {
    offset: number;
    limit: number;
}

export const useCreateUser = () => {
    const {commonFetch} = useFetch<LambdaResult.CreateUserResult>({
        url: LAMBDA_SERVICE_URL,
        method:"POST",
        clearUserInfoFromCacheIfUnauthorized:true,
        useAuthFromCache:true
    });

    const LambdaConfig:LambdaRequest = {
        route:"register",
    }

    const createUser = (createUserInput:CreateUserInput) => commonFetch({
        input:{
            ...LambdaConfig,
            ...createUserInput
        }
    });
    return { createUser };
}

export const useLoginUser = () => {
    const {commonFetch} = useFetch<LambdaResult.LoginUserResult>({
        url: LAMBDA_SERVICE_URL,
        method:"POST",
        clearUserInfoFromCacheIfUnauthorized:true,
        useAuthFromCache:true
    });

    const LambdaConfig:LambdaRequest = {
        route:"login",
    }

    const loginUser = (loginUserInput:LoginUserInput) => commonFetch({
        input:{
            ...LambdaConfig,
            ...loginUserInput
        }
    });

    return { loginUser };
}

export const useUploadProfilePic = () => {
    const {commonFetch} = useFetch<LambdaResult.UploadProfilePicResult>({
        url: LAMBDA_SERVICE_URL,
        method:"POST",
        clearUserInfoFromCacheIfUnauthorized:true,
        useAuthFromCache:true
    });

    const lambdaConfig:LambdaRequest = {
        route:"upload_profile_pic",
    }

    const uploadProfilePic = (uploadProfilePicInput:UploadProfilePicInput) => commonFetch({
        input:{
            ...lambdaConfig,
            ...uploadProfilePicInput
        }
    });

    return { uploadProfilePic };
}

export const useGetAccountDetails = () => {
    const {commonFetch} = useFetch<LambdaResult.GetAccountDetailsResult>({
        url: LAMBDA_SERVICE_URL,
        method:"POST",
        clearUserInfoFromCacheIfUnauthorized:true,
        useAuthFromCache:true
    });

    const lambdaConfig:LambdaRequest = {
        route:"get_account_details",
    }

    const getAccountDetails = () => commonFetch({
        input:{
            ...lambdaConfig
        }
    });

    return { getAccountDetails };
}

export const useGetRecentlyAccessedMeditationSessionsByUserId = () => {
    const {commonFetch} = useFetch<LambdaResult.GetRecentlyAccessedMeditationSessionsResult>({
        url: LAMBDA_SERVICE_URL,
        method:"POST",
        clearUserInfoFromCacheIfUnauthorized:true,
        useAuthFromCache:true
    });

    const lambdaConfig:LambdaRequest = {
        route:"get_recently_accessed_meditation_sessions_by_user_id",
    }

    const getRecentlyAccessedMeditationSessionsByUserId = (
        getRecentlyAccessedMeditationSessionsInput:GetRecentlyAccessedMeditationSessionsInput
    ) => commonFetch({
        input:{
            ...lambdaConfig,
            ...getRecentlyAccessedMeditationSessionsInput
        }
    });

    return { getRecentlyAccessedMeditationSessionsByUserId };
}

export const useGetFavourite = () => {
    const {commonFetch} = useFetch<LambdaResult.GetFavouriteResult>({
        url: LAMBDA_SERVICE_URL,
        method:"POST",
        clearUserInfoFromCacheIfUnauthorized:true,
        useAuthFromCache:true
    });

    const lambdaConfig:LambdaRequest = {
        route:"get_favourite",
    }

    const getFavourite = () => commonFetch({
        input:{
            ...lambdaConfig
        }
    });

    return { getFavourite };
}

export const useUpdateUserCurrentFocus = () => {
    const {commonFetch} = useFetch<LambdaResult.UpdateUserCurrentFocusResult>({
        url: LAMBDA_SERVICE_URL,
        method:"POST",
        clearUserInfoFromCacheIfUnauthorized:true,
        useAuthFromCache:true
    });

    const lambdaConfig:LambdaRequest = {
        route:"update_user_focus",
    }

    const updateUserCurrentFocus = (updateUserCurrentFocusInput:UpdateUserCurrentFocusInput) => commonFetch({
        input:{
            ...lambdaConfig,
            ...updateUserCurrentFocusInput
        }
    });

    return { updateUserCurrentFocus };
}
