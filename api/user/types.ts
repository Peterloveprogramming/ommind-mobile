import { LambdaResult, MeditationCourseSummary, RecentlyAccessedSession } from "@/api/types";

export type CreateUserInput = {
    name:string,
    email:string,
    password:string,
}

export type LoginUserInput = {
    email:string,
    password:string,
}

export type UploadProfilePicInput = {
    image: string;
}

export type UpdateUserNameAndEmailInput = {
    name:string,
    email:string,
    password?:string,
}

export type SubmitFeedbackInput = {
    type:"bug" | "improvement",
    description:string,
    image_data?:string | null,
}

export type NotifyCustomerFeedbackInput = {
    message: string,
}

export type UpdateUserCurrentFocusInput = {
    current_focus: string[];
}

export type GetRecentlyAccessedMeditationSessionsInput = {
    offset: number;
    limit: number;
}

export type CreateUserResult = LambdaResult<{
    jwt_token: string;
    user_id: number;
    name: string;
}>;

export type LoginUserResult = LambdaResult<{
    jwt_token: string;
}>;

export type UploadProfilePicResult = LambdaResult<{
    bucket: string;
    path: string;
    files: string[];
}>;

export type GetAccountDetailsResult = LambdaResult<{
    name: string;
    email: string;
    profile_pic: string | null;
    average_meditation_time_in_mins: number | null;
    total_meditation_time_in_mins: number | null;
    number_of_sessions_completed: number | null;
    number_of_days_active: number | null;
    current_focus: string[] | string | null;
    recently_accessed_courses?: MeditationCourseSummary[] | null;
    recently_accessed_sessions?: RecentlyAccessedSession[] | null;
} | null>;

export type GetUserNameAndEmailResult = LambdaResult<{
    name: string;
    email: string;
} | null>;

export type UpdateUserNameAndEmailResult = LambdaResult<{
    name: string;
    email: string;
} | null>;

export type SubmitFeedbackResult = LambdaResult<Record<string, unknown> | null>;

export type NotifyCustomerFeedbackResult = LambdaResult<Record<string, unknown> | null>;

export type GetRecentlyAccessedMeditationSessionsResult = LambdaResult<{
    recently_accessed_sessions: RecentlyAccessedSession[];
} | null>;

export type GetFavouriteResult = LambdaResult<{
    favourite_sessions: RecentlyAccessedSession[];
} | null>;

export type UpdateUserCurrentFocusResult = LambdaResult<{
    current_focus: string[] | string | null;
} | null>;
