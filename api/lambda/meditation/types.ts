import { LambdaResult } from "@/api/types";

export type MeditationCourseSession = {
  session_title: string;
  session_length: number;
  session_number: number;
};

export type MeditationCourseDescriptionSection = {
  intro?: string;
  outro?: string;
  bullets?: string[];
};

export type MeditationCourse = {
  id: number;
  course_id:number;
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
