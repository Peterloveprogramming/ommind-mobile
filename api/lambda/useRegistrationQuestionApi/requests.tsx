import { useFetch } from "@/api/useFetch";
import {LAMBDA_SERVICE_URL} from "@/constant"
import { LambdaResult ,LambdaRequest} from "../../types";

type saveAnswersForRegistrationQuestionsType = {
    "1":string,
    "2":string,
    "3":string,
    "4":string,
    "5":string
}
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

    const saveAnswersForRegistrationQuestions = (saveAnswersForRegistrationQuestionsInput:saveAnswersForRegistrationQuestionsType) => {
        const answers = { answers: saveAnswersForRegistrationQuestionsInput };
        return commonFetch({
        input:{
            ...LambdaConfig,
            ...answers
        }})
    };
    return { saveAnswersForRegistrationQuestions };
}

