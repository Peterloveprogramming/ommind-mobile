import { LambdaResult } from "@/api/types";

export type MeditationCourseSession = {
  course_id?: number | null;
  favourite: 0 | 1;
  message_id?: number | null;
  session_title: string;
  session_length: number;
  session_number: number;
  session_completed: 0 | 1;
  progress?: number | null;
};

export type MeditationCourseDescriptionSection = {
  intro?: string;
  outro?: string;
  bullets?: string[];
};

export type MeditationCourse = {
  id: number;
  course_id: number;
  uuid: string;
  number_of_sessions: number;
  type: "calm" | "awareness" | "insight";
  course_number: number;
  proper_type_name: string;
  title: string;
  sessions: MeditationCourseSession[];
  image_url: string;
  description: {
    who_this_is_for: MeditationCourseDescriptionSection;
    about_this_series: string[];
    what_you_can_expect: MeditationCourseDescriptionSection;
    source_and_integrity: string[];
  };
  background_url: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type MeditationCoursesByType = {
  calm: MeditationCourse[];
  awareness: MeditationCourse[];
  insight: MeditationCourse[];
};

export type GetMeditationCoursesResult = LambdaResult<{
  courses: MeditationCoursesByType;
} | null>;

export type GetRecommendedMeditationCoursesResult = LambdaResult<{
  courses: MeditationCourse[];
} | null>;

export type GetHomePageTextResult = LambdaResult<{
  home_page_text: string;
} | null>;

export type GetIntentionAndAffirmationInput = {
  mood: string;
};

export type GetIntentionAndAffirmationResult = LambdaResult<{
  intention: string;
  affirmation: string;
} | null>;

export type AddMoodCheckInInput = {
  mood: string;
  timezone: string;
};

export type MoodCheckIn = {
  id: number;
  mood: string;
  user_id: number;
  created_at: string | null;
  check_in_date: string | null;
  timezone: string;
};

export type AddMoodCheckInResult = LambdaResult<MoodCheckIn | null>;

export type GetMeditationCourseDetailsInput = {
  type: MeditationCourse["type"];
  uuid: string;
};

export type GetMeditationCourseDetailsResult = LambdaResult<{
  course_details: MeditationCourse;
} | null>;

export type GetMeditationAudioInput = {
  type: string;
  course_number: number;
  session_number: number;
};

export type MeditationAudioUrls = {
  audio: string[];
  bgm: string[];
};

export type GetMeditationAudioUrlResult = LambdaResult<MeditationAudioUrls | null>;

export type UpdateSessionProgressInput = {
  type: string;
  course_number: number;
  session_number: number;
  accessed_type: string;
  progress: number;
  accumulated_minutes: number;
  completed: boolean;
};

export type UpdateSessionProgressResult = LambdaResult<
  (UpdateSessionProgressInput & { user_id: number }) | null
>;
