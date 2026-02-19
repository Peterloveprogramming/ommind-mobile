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
            "chat",
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


export namespace LambdaResult {
  export type CreateUserResult = LambdaResult<{
    jwt_token: string;
    user_id: number;
    name: string;
  }>;

}





