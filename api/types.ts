//Supplier
export type GetSupplierInput = {id:string}

export type CreateSupplierInput = {
    name:string;
    phoneNumber:string;
    emailAddress:string;
}

export type Supplier = {
    id:string;
    name:string;
    phoneNumber:string;
    emailAddress:string;
    createdOn:string;
    createdBy:string
}
//Todo 
export type getTodoInput = {id:string}

export type Todo = {
    userId:string,
    id:string,
    title:string,
    completed:string
}



// --- Lambda ---
export type LambdaRequest = {
    route:  "register"|
            "login" |
            "jwt_valid"|
            "save_registration_question_answers" |
            "chat" |
            "get_chat_history" |
            "get_chat_messages_by_session_id" |
            "add_message_rating" |
            "add_message_report" |
            "get_audio_url" |
            "get_all_courses" |
            "get_meditation_course_details" |
            "get_dream_logs" |
            "get_dream_log" |
            "add_dream_log" |
            "update_dream_log" |
            "delete_dream_log",
}

// Lambda Result 
// export type LambdaResult = {
//     statusCode:number,
//     response:"string"
//     data:{[key:string]:any} | void;
// }
export type LambdaResult <T = void, R = string> = {
    statusCode:number,
    response:R,
    data:T
}

// User 
export type CreateUserInput = {
    name:string,
    email:string,
    password:string,
}

export type LoginUserInput = {
    email:string,
    password:string,
}


export namespace LambdaResult {
  export type DreamLogItem = {
    id?: number;
    user_id?: number;
    log?: string | null;
    title?: string | null;
    content?: string | null;
    interpretation?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    [key: string]: unknown;
  };

  export type MessageRatingItem = {
    id?: number;
    user_id?: number;
    message_id?: number;
    session_id?: string;
    rating?: number;
    helpfulness?: number | null;
    accuracy?: number | null;
    clarity?: number | null;
    tone?: number | null;
    issues?: string[] | null;
    other_details?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    [key: string]: unknown;
  };

  export type MessageReportItem = {
    id?: number;
    user_id?: number;
    message_id?: number;
    issues?: string[] | null;
    other_details?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    [key: string]: unknown;
  };

  export type CreateUserResult = LambdaResult<{
    jwt_token: string;
    user_id: number;
    name: string;
  }>;

  export type LoginUserResult = LambdaResult<{
    jwt_token: string;
  }>;

  export type ChatHistoryItem = {
    title: string;
    session_id: string;
    last_message_at?: string | null;
  };

  export type GetChatHistoryResult = LambdaResult<ChatHistoryItem[]>;

  export type ChatMessageItem = {
    id: number;
    session_id: string;
    user_id: number;
    content: string;
    role: string;
    model: string | null;
    classification: string | null;
    needs_stage: string | null;
    needs_categorization_reasoning: string | null;
    needs_categorization_confidence: number | null;
    rating: number | null;
    archived: boolean;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
  };

  export type GetChatMessagesBySessionIdResult = LambdaResult<ChatMessageItem[]>;

  export type ChatResult = LambdaResult<ChatMessageItem, ChatMessageItem> & {
    mode?: string | null;
  };

  export type AddMessageRatingResult = LambdaResult<MessageRatingItem | null>;
  export type AddMessageReportResult = LambdaResult<MessageReportItem | null>;
  export type GetDreamLogsResult = LambdaResult<DreamLogItem[]>;
  export type GetDreamLogResult = LambdaResult<DreamLogItem | null>;
  export type AddDreamLogResult = LambdaResult<DreamLogItem | null>;
  export type UpdateDreamLogResult = LambdaResult<DreamLogItem | null>;
  export type DeleteDreamLogResult = LambdaResult<DreamLogItem | null>;

}
