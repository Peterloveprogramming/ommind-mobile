import { useGetSupplier,useCreateSupplier } from "./useSupplierApi/requests";
import {useGetTodo} from './useTodoApi/requests'
import {useCreateUser, useLoginUser} from './lambda/useUserApi/requests'
import {useSaveAnswersForRegistrationQuestions} from './lambda/useRegistrationQuestionApi/requests'
import { useChatAi } from "./lambda/useAiChatApi/requests";
import { useGetChatHistory } from "./lambda/useChatHistoryApi/requests";
import { useGetChatMessagesBySessionId } from "./lambda/useChatMessagesApi/requests";
import { useAddMessageRating } from "./lambda/useMessageRatingApi/requests";
import { useAddMessageReport } from "./lambda/useMessageReportApi/requests";
import {
    useAddDreamLog,
    useDeleteDreamLog,
    useGetDreamLog,
    useGetDreamLogs,
    useUpdateDreamLog,
} from "./lambda/useDreamLogsApi/requests";
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
    const {
        loginUser,
    } = useLoginUser()

    return {
        createUser:{
            createUser
        },
        loginUser:{
            loginUser
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

export const useChatHistoryApi = () => {
    const {
        getChatHistory
    } = useGetChatHistory()

    return {
        getChatHistory: {
            getChatHistory
        }
    }
}

export const useChatMessagesApi = () => {
    const {
        getChatMessagesBySessionId
    } = useGetChatMessagesBySessionId()

    return {
        getChatMessagesBySessionId: {
            getChatMessagesBySessionId
        }
    }
}

export const useMessageRatingApi = () => {
    const {
        addMessageRating
    } = useAddMessageRating()

    return {
        addMessageRating: {
            addMessageRating
        }
    }
}

export const useMessageReportApi = () => {
    const {
        addMessageReport
    } = useAddMessageReport()

    return {
        addMessageReport: {
            addMessageReport
        }
    }
}

export const useDreamLogsApi = () => {
    const {
        getDreamLogs
    } = useGetDreamLogs()
    const {
        getDreamLog
    } = useGetDreamLog()
    const {
        addDreamLog
    } = useAddDreamLog()
    const {
        updateDreamLog
    } = useUpdateDreamLog()
    const {
        deleteDreamLog
    } = useDeleteDreamLog()

    return {
        getDreamLogs: {
            getDreamLogs
        },
        getDreamLog: {
            getDreamLog
        },
        addDreamLog: {
            addDreamLog
        },
        updateDreamLog: {
            updateDreamLog
        },
        deleteDreamLog: {
            deleteDreamLog
        }
    }
}
