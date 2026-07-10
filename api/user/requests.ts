import { useFetch } from "@/api/useFetch";
import {LAMBDA_SERVICE_URL} from "@/constant"
import { LambdaRequest } from "@/api/types";
import {
    CreateUserInput,
    LoginUserInput,
    UploadProfilePicInput,
    UpdateUserNameAndEmailInput,
    SubmitFeedbackInput,
    NotifyCustomerFeedbackInput,
    UpdateUserCurrentFocusInput,
    GetRecentlyAccessedMeditationSessionsInput,
    CreateUserResult,
    LoginUserResult,
    UploadProfilePicResult,
    GetAccountDetailsResult,
    GetUserNameAndEmailResult,
    UpdateUserNameAndEmailResult,
    SubmitFeedbackResult,
    NotifyCustomerFeedbackResult,
    GetRecentlyAccessedMeditationSessionsResult,
    GetFavouriteResult,
    UpdateUserCurrentFocusResult,
} from "./types";

export const useCreateUser = () => {
    const {commonFetch} = useFetch<CreateUserResult>({
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
    const {commonFetch} = useFetch<LoginUserResult>({
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
    const {commonFetch} = useFetch<UploadProfilePicResult>({
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
    const {commonFetch} = useFetch<GetAccountDetailsResult>({
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

export const useGetUserNameAndEmail = () => {
    const {commonFetch} = useFetch<GetUserNameAndEmailResult>({
        url: LAMBDA_SERVICE_URL,
        method:"POST",
        clearUserInfoFromCacheIfUnauthorized:true,
        useAuthFromCache:true
    });

    const lambdaConfig:LambdaRequest = {
        route:"get_user_name_and_email",
    }

    const getUserNameAndEmail = () => commonFetch({
        input:{
            ...lambdaConfig
        }
    });

    return { getUserNameAndEmail };
}

export const useUpdateUserNameAndEmail = () => {
    const {commonFetch} = useFetch<UpdateUserNameAndEmailResult>({
        url: LAMBDA_SERVICE_URL,
        method:"POST",
        clearUserInfoFromCacheIfUnauthorized:true,
        useAuthFromCache:true
    });

    const lambdaConfig:LambdaRequest = {
        route:"update_user_name_and_email",
    }

    const updateUserNameAndEmail = (updateUserNameAndEmailInput:UpdateUserNameAndEmailInput) => commonFetch({
        input:{
            ...lambdaConfig,
            ...updateUserNameAndEmailInput
        }
    });

    return { updateUserNameAndEmail };
}

export const useSubmitFeedback = () => {
    const {commonFetch} = useFetch<SubmitFeedbackResult>({
        url: LAMBDA_SERVICE_URL,
        method:"POST",
        clearUserInfoFromCacheIfUnauthorized:true,
        useAuthFromCache:true
    });

    const lambdaConfig:LambdaRequest = {
        route:"submit_feedback",
    }

    const submitFeedback = (submitFeedbackInput:SubmitFeedbackInput) => commonFetch({
        input:{
            ...lambdaConfig,
            ...submitFeedbackInput
        }
    });

    return { submitFeedback };
}

export const useNotifyCustomerFeedback = () => {
    const {commonFetch} = useFetch<NotifyCustomerFeedbackResult>({
        url: LAMBDA_SERVICE_URL,
        method:"POST",
        clearUserInfoFromCacheIfUnauthorized:true,
        useAuthFromCache:true
    });

    const lambdaConfig:LambdaRequest = {
        route:"notify_customer_feedback",
    }

    const notifyCustomerFeedback = (notifyCustomerFeedbackInput:NotifyCustomerFeedbackInput) => commonFetch({
        input:{
            ...lambdaConfig,
            ...notifyCustomerFeedbackInput
        }
    });

    return { notifyCustomerFeedback };
}

export const useGetRecentlyAccessedMeditationSessionsByUserId = () => {
    const {commonFetch} = useFetch<GetRecentlyAccessedMeditationSessionsResult>({
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
    const {commonFetch} = useFetch<GetFavouriteResult>({
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
    const {commonFetch} = useFetch<UpdateUserCurrentFocusResult>({
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
