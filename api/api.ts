import {
    useCreateUser,
    useGetAccountDetails,
    useGetFavourite,
    useGetRecentlyAccessedMeditationSessionsByUserId,
    useGetUserNameAndEmail,
    useLoginUser,
    useNotifyCustomerFeedback,
    useSubmitFeedback,
    useUpdateUserCurrentFocus,
    useUpdateUserNameAndEmail,
    useUploadProfilePic
} from './user/requests'
import {useSaveAnswersForRegistrationQuestions} from './registrationQuestion/requests'
import { useChatAi } from "./chatAi/requests";
import { useGetChatHistory } from "./chatHistory/requests";
import { useGetChatMessageContentById, useGetChatMessagesBySessionId } from "./chatMessages/requests";
import { useAddMessageRating } from "./messageRating/requests";
import { useAddMessageReport } from "./messageReport/requests";
import {
    useAddAwarenessLog,
    // Reflection is disabled for now.
    // useAnalyzeAwareness,
    useBulkDeleteAwarenessLogs,
    useDeleteAwarenessLog,
    useGetAwarenessLog,
    useGetAwarenessLogs,
    useUpdateAwarenessLog,
} from "./awarenessLogs/requests";
import {
    useAddDreamLog,
    useBulkDeleteDreamLogs,
    useDeleteDreamLog,
    useGetDreamLog,
    useGetDreamLogs,
    useUpdateDreamLog,
} from "./dreamLogs/requests";

//User
export const useUserApi =() => {
    const {
        createUser,
    } = useCreateUser()
    const {
        loginUser,
    } = useLoginUser()
    const {
        uploadProfilePic,
    } = useUploadProfilePic()
    const {
        getAccountDetails,
    } = useGetAccountDetails()
    const {
        getUserNameAndEmail,
    } = useGetUserNameAndEmail()
    const {
        updateUserNameAndEmail,
    } = useUpdateUserNameAndEmail()
    const {
        submitFeedback,
    } = useSubmitFeedback()
    const {
        notifyCustomerFeedback,
    } = useNotifyCustomerFeedback()
    const {
        getRecentlyAccessedMeditationSessionsByUserId,
    } = useGetRecentlyAccessedMeditationSessionsByUserId()
    const {
        getFavourite,
    } = useGetFavourite()
    const {
        updateUserCurrentFocus,
    } = useUpdateUserCurrentFocus()

    return {
        createUser:{
            createUser
        },
        loginUser:{
            loginUser
        },
        uploadProfilePic:{
            uploadProfilePic
        },
        getAccountDetails:{
            getAccountDetails
        },
        getUserNameAndEmail:{
            getUserNameAndEmail
        },
        updateUserNameAndEmail:{
            updateUserNameAndEmail
        },
        submitFeedback:{
            submitFeedback
        },
        notifyCustomerFeedback:{
            notifyCustomerFeedback
        },
        getRecentlyAccessedMeditationSessionsByUserId:{
            getRecentlyAccessedMeditationSessionsByUserId
        },
        getFavourite:{
            getFavourite
        },
        updateUserCurrentFocus:{
            updateUserCurrentFocus
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
        chatAi,
        chatSubmit,
        analyzeDream,
        chatJobStatus,
        getActiveChatJob
    } = useChatAi()

    return {
        chatAi:{
            chatAi,
            chatSubmit,
            analyzeDream,
            chatJobStatus,
            getActiveChatJob
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
    const {
        getChatMessageContentById
    } = useGetChatMessageContentById()

    return {
        getChatMessagesBySessionId: {
            getChatMessagesBySessionId
        },
        getChatMessageContentById: {
            getChatMessageContentById
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
    const {
        bulkDeleteDreamLogs
    } = useBulkDeleteDreamLogs()

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
        },
        bulkDeleteDreamLogs: {
            bulkDeleteDreamLogs
        },
    }
}

export const useAwarenessLogsApi = () => {
    const {
        getAwarenessLogs
    } = useGetAwarenessLogs()
    const {
        getAwarenessLog
    } = useGetAwarenessLog()
    const {
        addAwarenessLog
    } = useAddAwarenessLog()
    const {
        updateAwarenessLog
    } = useUpdateAwarenessLog()
    const {
        deleteAwarenessLog
    } = useDeleteAwarenessLog()
    const {
        bulkDeleteAwarenessLogs
    } = useBulkDeleteAwarenessLogs()
    // Reflection is disabled for now.
    // const {
    //     analyzeAwareness
    // } = useAnalyzeAwareness()

    return {
        getAwarenessLogs: {
            getAwarenessLogs
        },
        getAwarenessLog: {
            getAwarenessLog
        },
        addAwarenessLog: {
            addAwarenessLog
        },
        updateAwarenessLog: {
            updateAwarenessLog
        },
        deleteAwarenessLog: {
            deleteAwarenessLog
        },
        bulkDeleteAwarenessLogs: {
            bulkDeleteAwarenessLogs
        },
        // Reflection is disabled for now.
        // analyzeAwareness: {
        //     analyzeAwareness
        // }
    }
}
