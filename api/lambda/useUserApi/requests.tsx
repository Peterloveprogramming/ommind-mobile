import { useFetch } from "@/api/useFetch";
import {LAMBDA_SERVICE_URL} from "@/constant"
import { LambdaResult,CreateUserInput ,LambdaRequest} from "../../types";

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

