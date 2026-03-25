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
            "get_audio_url" |
            "get_all_courses" |
            "get_meditation_course_details",
}

// Lambda Result 
// export type LambdaResult = {
//     statusCode:number,
//     response:"string"
//     data:{[key:string]:any} | void;
// }
export type LambdaResult <T = void> = {
    statusCode:number,
    response:string,
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

}
