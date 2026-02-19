import { useGetSupplier,useCreateSupplier } from "./useSupplierApi/requests";
import {useGetTodo} from './useTodoApi/requests'
import {useCreateUser} from './lambda/useUserApi/requests'
import {useSaveAnswersForRegistrationQuestions} from './lambda/useRegistrationQuestionApi/requests'
import { useChatAi } from "./lambda/useAiChatApi/requests";
//Supplier
export const useSupplierApi = () => {
    const {
        getSupplier,
        isLoading: getSupplierLoading,
        data: getSupplierData
    } = useGetSupplier()

    const {
        createSupplier,
        isLoading: createSupplierLoading,
        data: createSupplierData
    } = useCreateSupplier()

    return {
        getSupplier:{
            query:getSupplier,
            isLoading:getSupplierLoading,
            data:getSupplierData
        },
        createSupplier:{
            mutation:createSupplier,
            isLoading: createSupplierLoading,
            data: createSupplierData
        },
    }
}

//Todo 
type useTodoApiProps = {
    id:string
}
export const useTodoApi =({id}:useTodoApiProps) => {
    const {
        getTodo, 
        isLoading, 
        data 
    } = useGetTodo({id})

    return {
        getDodo:{
            getTodo:getTodo,
            getTodoLoading:isLoading,
            getTodoData:data
        }
    }
}

//User
export const useUserApi =() => {
    const {
        createUser, 
    } = useCreateUser()

    return {
        createUser:{
            createUser
        }
    }
}

//Registration Question

export const useRegistrationQuestionApi =() => {
    const {
        saveAnswersForRegistrationQuestions, 
    } = useSaveAnswersForRegistrationQuestions()

    return {
        saveAnswers:{
            saveAnswersForRegistrationQuestions
        }
    }
}

//ChatAi
export const useChatAiApi =() => {
    const {
        chatAi
    } = useChatAi()

    return {
        chatAi:{
            chatAi
        }
    }
}