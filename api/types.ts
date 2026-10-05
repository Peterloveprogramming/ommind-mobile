// --- Lambda ---
export type LambdaRequest = {
    route:  "register"|
            "login" |
            "upload_profile_pic" |
            "get_account_details" |
            "get_user_name_and_email" |
            "update_user_name_and_email" |
            "submit_feedback" |
            "notify_customer_feedback" |
            "get_recently_accessed_meditation_sessions_by_user_id" |
            "get_favourite" |
            "update_user_focus" |
            "jwt_valid"|
            "save_registration_question_answers" |
            "chat" |
            "chat_submit" |
            "chat_job_status" |
            "get_active_chat_job" |
            "get_chat_history" |
            "get_chat_messages_by_session_id" |
            "get_chat_message_content_by_id" |
            "add_message_rating" |
            "add_message_report" |
            "get_audio_url" |
            "get_all_courses" |
            "get_recommended_session" |
            "get_home_page_text" |
            "get_homepage_info" |
            "get_intention_and_affirmation" |
            "add_mood_check_in" |
            "reset_daily_mood" |
            "get_meditation_course_details" |
            "add_recently_accessed_course" |
            "add_recently_accessed_session" |
            "update_session_progress" |
            "update_favourite" |
            "get_awareness_logs" |
            "get_awareness_log" |
            "add_awareness_log" |
            "update_awareness_log" |
            "delete_awareness_log" |
            "bulk_delete_awareness_logs" |
            // Reflection is disabled for now.
            // "analyze_awareness" |
            "get_dream_logs" |
            "get_dream_log" |
            "add_dream_log" |
            "update_dream_log" |
            "delete_dream_log" |
            "bulk_delete_dream_logs" |
            "trigger_memory_facts_update_agent",
            // Reflection is disabled for now.
            // "analyze_dream",
    action?: string;
    user_id?: number | string;
    ip_address?: string;
    device_type?: string;
    os_version?: string;
    app_version?: string;
    jwt_token?: string;
}

export type LambdaResult <T = void, R = string> = {
    statusCode:number,
    response:R,
    data:T
}

// Cross-domain types referenced by more than one api/<domain> (e.g. user + meditation)
export type MeditationCourseSummary = {
    id: number;
    course_id?: number;
    uuid: string;
    number_of_sessions: number;
    type: "calm" | "awareness" | "insight";
    course_number: number;
    proper_type_name: string;
    title: string;
    image_url: string;
    background_url?: string;
    created_at?: string;
    updated_at?: string;
}

export type RecentlyAccessedSession = {
    id: number;
    user_id: number;
    course_number: number | null;
    course_id?: number | null;
    session_number: number | null;
    session_length_in_mins: number | null;
    session_progress_in_secs?: number | null;
    session_title: string;
    favourite?: 0 | 1 | null;
    image_url?: string | null;
    background_url?: string | null;
    is_generated: 0 | 1;
    type: "calm" | "awareness" | "insight" | string;
    message_id?: number | null;
    timestamp?: string | null;
}
