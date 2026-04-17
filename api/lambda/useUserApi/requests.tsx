import { useFetch } from "@/api/useFetch";
import {LAMBDA_SERVICE_URL} from "@/constant"
import { LambdaResult,CreateUserInput, LoginUserInput, LambdaRequest} from "../../types";

export type UploadProfilePicInput = {
    image: string;
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
