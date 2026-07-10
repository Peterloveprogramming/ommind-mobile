import { useFetch } from "@/api/useFetch";
import {LAMBDA_SERVICE_URL} from "@/constant"
import { LambdaRequest } from "@/api/types";
import { ChatAiInput, ChatResult } from "./types";

export const useChatAi = () => {
    const {commonFetch} = useFetch<ChatResult>({
        url: LAMBDA_SERVICE_URL,
        method:"POST",
        clearUserInfoFromCacheIfUnauthorized:true,
        useAuthFromCache:true
    });

    const LambdaConfig:LambdaRequest = {
        route:"chat",
    }

    const chatAi = (chatAiInput:ChatAiInput) => {
        return commonFetch({
        input:{
            ...LambdaConfig,
            ...chatAiInput
        }})
    };
    return { chatAi };
}
