import { useFetch } from "@/api/useFetch";
import {LAMBDA_SERVICE_URL} from "@/constant"
import { LambdaResult, LambdaRequest } from "@/api/types";
import { SaveAnswersForRegistrationQuestionsInput } from "./types";

export const useSaveAnswersForRegistrationQuestions = () => {
    const {commonFetch} = useFetch<LambdaResult>({
        url: LAMBDA_SERVICE_URL,
        method:"POST",
        clearUserInfoFromCacheIfUnauthorized:true,
        useAuthFromCache:true
    });

    const LambdaConfig:LambdaRequest = {
        route:"save_registration_question_answers",
    }

    const saveAnswersForRegistrationQuestions = (saveAnswersForRegistrationQuestionsInput:SaveAnswersForRegistrationQuestionsInput) => {
        const answers = { answers: saveAnswersForRegistrationQuestionsInput };
        return commonFetch({
        input:{
            ...LambdaConfig,
            ...answers
        }})
    };
    return { saveAnswersForRegistrationQuestions };
}
