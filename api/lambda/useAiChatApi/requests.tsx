import { useFetch } from "@/api/useFetch";
import {LAMBDA_SERVICE_URL} from "@/constant"
import { LambdaResult ,LambdaRequest} from "../../types";

type chatAiProps = {
    "session_id":string,
    "question":string,
}
export const useChatAi = () => {
    const {commonFetch} = useFetch<LambdaResult>({
        url: LAMBDA_SERVICE_URL,
        method:"POST",
        clearUserInfoFromCacheIfUnauthorized:true,
        useAuthFromCache:true
    });

    const LambdaConfig:LambdaRequest = {
        route:"chat",
    }

    const chatAi = (chatAiInput:chatAiProps) => {
        return commonFetch({
        input:{
            ...LambdaConfig,
            ...chatAiInput
        }})
    };
    return { chatAi };
}

