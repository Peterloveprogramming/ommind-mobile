import { useFetch } from "@/api/useFetch";
import {LAMBDA_SERVICE_URL} from "@/constant"
import { LambdaRequest } from "@/api/types";
import { ActiveChatJobResult, AnalyzeDreamInput, ChatAiInput, ChatJobResult, ChatResult } from "./types";

// Submit / status / active-job calls never wait on the LLM, so they get a
// short timeout instead of useFetch's 45s default.
const CHAT_JOB_TIMEOUT_MS = 30000;

export const useChatAi = () => {
    const {commonFetch} = useFetch<ChatResult>({
        url: LAMBDA_SERVICE_URL,
        method:"POST",
        clearUserInfoFromCacheIfUnauthorized:true,
        useAuthFromCache:true
    });
    const {commonFetch: chatJobFetch} = useFetch<ChatJobResult>({
        url: LAMBDA_SERVICE_URL,
        method:"POST",
        clearUserInfoFromCacheIfUnauthorized:true,
        useAuthFromCache:true,
        timeoutMs: CHAT_JOB_TIMEOUT_MS,
    });
    const {commonFetch: activeChatJobFetch} = useFetch<ActiveChatJobResult>({
        url: LAMBDA_SERVICE_URL,
        method:"POST",
        clearUserInfoFromCacheIfUnauthorized:true,
        useAuthFromCache:true,
        timeoutMs: CHAT_JOB_TIMEOUT_MS,
    });

    const LambdaConfig:LambdaRequest = {
        route:"chat",
    }

    const chatAi = (chatAiInput:ChatAiInput, fetchOptions?: RequestInit) => {
        return commonFetch({
        input:{
            ...LambdaConfig,
            ...chatAiInput
        },
        fetchOptions})
    };

    // Queues the chat turn; the server answers 202 with the job, not the reply.
    const chatSubmit = (chatAiInput:ChatAiInput, fetchOptions?: RequestInit) => {
        const route: LambdaRequest["route"] = "chat_submit";
        return chatJobFetch({
        input:{
            route,
            ...chatAiInput
        },
        fetchOptions})
    };

    // Queues a dream analysis for a saved dream log; same 202 job shape as chatSubmit.
    const analyzeDream = (analyzeDreamInput:AnalyzeDreamInput, fetchOptions?: RequestInit) => {
        const route: LambdaRequest["route"] = "analyze_dream";
        return chatJobFetch({
        input:{
            route,
            ...analyzeDreamInput
        },
        fetchOptions})
    };

    const chatJobStatus = (
        input: { request_id: string; session_id: string },
        fetchOptions?: RequestInit
    ) => {
        const route: LambdaRequest["route"] = "chat_job_status";
        return chatJobFetch({
        input:{
            route,
            ...input
        },
        fetchOptions})
    };

    // The queued/running job for the session (data is null when nothing is generating).
    const getActiveChatJob = (
        input: { session_id: string },
        fetchOptions?: RequestInit
    ) => {
        const route: LambdaRequest["route"] = "get_active_chat_job";
        return activeChatJobFetch({
        input:{
            route,
            ...input
        },
        fetchOptions})
    };

    return { chatAi, chatSubmit, analyzeDream, chatJobStatus, getActiveChatJob };
}
