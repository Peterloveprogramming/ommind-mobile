import React, { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { setAudioModeAsync, setIsAudioActiveAsync } from "expo-audio";
import CourseSessionPlayer from "@/comp/meditation_session/player/CourseSessionPlayer";
import GeneratedSessionPlayer from "@/comp/meditation_session/player/GeneratedSessionPlayer";
import {
  parseSessionPlayerParams,
  type SessionPlayerRouteParams,
} from "@/comp/meditation_session/player/sessionPlayerParams";

const SessionPlayer = () => {
  const params = useLocalSearchParams<SessionPlayerRouteParams>();
  const parsedParams = parseSessionPlayerParams(params);

  useEffect(() => {
    const configureAudio = async () => {
      await setIsAudioActiveAsync(true);
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: "mixWithOthers",
      });
    };

    void configureAudio();
  }, []);

  if (parsedParams.kind === "generated") {
    return <GeneratedSessionPlayer {...parsedParams} />;
  }

  return <CourseSessionPlayer {...parsedParams} />;
};

export default SessionPlayer;
