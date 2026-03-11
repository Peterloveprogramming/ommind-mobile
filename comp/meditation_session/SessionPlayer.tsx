import React, { useEffect, useMemo, useState } from "react";
import { GestureResponderEvent, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  setAudioModeAsync,
  setIsAudioActiveAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { FONTS } from "@/theme";
import { useMeditationAudioService } from "@/services/useMeditationAudioService";
import BaseButton from "../base/BaseButton";

const SEEK_STEP_SECONDS = 10;

// const getSingleParam = (value?: string | string[]) => {
//   if (Array.isArray(value)) {
//     return value[0];
//   }

//   return value;
// };

// const formatTime = (timeInSeconds: number) => {
//   const safeTime = Number.isFinite(timeInSeconds) ? Math.max(timeInSeconds, 0) : 0;
//   const minutes = Math.floor(safeTime / 60);
//   const seconds = Math.floor(safeTime % 60);

//   return `${minutes}:${seconds.toString().padStart(2, "0")}`;
// };

// const SessionPlayer = () => {
//   const params = useLocalSearchParams<{
//     title?: string | string[];
//     type?: string | string[];
//     course_number?: string | string[];
//     session_number?: string | string[];
//   }>();
//   const { status, result, error, fetchMeditationAudioUrl } = useMeditationAudioService();
//   const audioUrl = result?.data?.audio?.[0] ?? null;
//   const bgmUrl = result?.data?.bgm?.[0] ?? null;
//   const voicePlayer = useAudioPlayer(audioUrl, { updateInterval: 500 });
//   const bgmPlayer = useAudioPlayer(bgmUrl, { updateInterval: 500 });
//   const voiceStatus = useAudioPlayerStatus(voicePlayer);
//   const bgmStatus = useAudioPlayerStatus(bgmPlayer);
//   const [progressTrackWidth, setProgressTrackWidth] = useState(0);

//   useEffect(() => {
//     const meditationType = getSingleParam(params.type);
//     const courseNumber = Number(getSingleParam(params.course_number));
//     const sessionNumber = Number(getSingleParam(params.session_number));

//     if (!meditationType || Number.isNaN(courseNumber) || Number.isNaN(sessionNumber)) {
//         console.error("meditationType or courseNumber or sessionNumber is missing ")
//       return;
//     }

//     void fetchMeditationAudioUrl({
//       type: meditationType,
//       course_number: courseNumber,
//       session_number: sessionNumber,
//     });
//   }, [fetchMeditationAudioUrl, params.course_number, params.session_number, params.type]);

//   const title = getSingleParam(params.title);

//   useEffect(() => {
//     const configureAudio = async () => {
//       await setIsAudioActiveAsync(true);
//       await setAudioModeAsync({
//         playsInSilentMode: true,
//         shouldPlayInBackground: true,
//         interruptionMode: "mixWithOthers",
//       });
//     };

//     void configureAudio();
//   }, []);

//   useEffect(() => {
//     if (!audioUrl || !bgmUrl) {
//       return;
//     }

//     console.log("audio urls ready", {
//       audioUrl,
//       bgmUrl,
//     });
//   }, [audioUrl, bgmUrl]);

//   useEffect(() => {
//     if (!audioUrl || !bgmUrl) {
//       return;
//     }

//     voicePlayer.volume = 1;
//     voicePlayer.loop = false;
//     bgmPlayer.volume = 0.2;
//     bgmPlayer.loop = true;
//   }, [audioUrl, bgmUrl, bgmPlayer, voicePlayer]);

//   useEffect(() => {
//     console.log("voice status", {
//       isLoaded: voiceStatus.isLoaded,
//       playing: voiceStatus.playing,
//       isBuffering: voiceStatus.isBuffering,
//       duration: voiceStatus.duration,
//       currentTime: voiceStatus.currentTime,
//     });
//   }, [
//     voiceStatus.currentTime,
//     voiceStatus.duration,
//     voiceStatus.isBuffering,
//     voiceStatus.isLoaded,
//     voiceStatus.playing,
//   ]);

//   useEffect(() => {
//     console.log("bgm status", {
//       isLoaded: bgmStatus.isLoaded,
//       playing: bgmStatus.playing,
//       isBuffering: bgmStatus.isBuffering,
//       duration: bgmStatus.duration,
//       currentTime: bgmStatus.currentTime,
//     });
//   }, [
//     bgmStatus.currentTime,
//     bgmStatus.duration,
//     bgmStatus.isBuffering,
//     bgmStatus.isLoaded,
//     bgmStatus.playing,
//   ]);

//   useEffect(() => {
//     if (!voiceStatus.didJustFinish) {
//       return;
//     }

//     bgmPlayer.pause();
//     void bgmPlayer.seekTo(0);
//   }, [bgmPlayer, voiceStatus.didJustFinish]);

//   const duration = voiceStatus.duration || 0;
//   const currentTime = voiceStatus.currentTime || 0;
//   const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
//   const progressPercentage = useMemo(() => `${progress * 100}%`, [progress]);

//   const seekToTime = async (seconds: number) => {
//     const clampedSeconds = Math.max(0, Math.min(seconds, duration || 0));

//     await Promise.all([
//       voicePlayer.seekTo(clampedSeconds),
//       bgmPlayer.seekTo(clampedSeconds),
//     ]);
//   };

//   const handleSkipBackward = () => {
//     void seekToTime(currentTime - SEEK_STEP_SECONDS);
//   };

//   const handleSkipForward = () => {
//     void seekToTime(currentTime + SEEK_STEP_SECONDS);
//   };

//   const handleProgressPress = (event: GestureResponderEvent) => {
//     if (!duration || !progressTrackWidth) {
//       return;
//     }

//     const nextTime = (event.nativeEvent.locationX / progressTrackWidth) * duration;
//     void seekToTime(nextTime);
//   };

//   const handleProgressLayout = (event: LayoutChangeEvent) => {
//     setProgressTrackWidth(event.nativeEvent.layout.width);
//   };

//   const handlePlay = () => {
//     if (!audioUrl || !bgmUrl) {
//       console.log("play blocked: missing audio urls");
//       return;
//     }

//     if (!voiceStatus.isLoaded || !bgmStatus.isLoaded) {
//       console.log("play blocked: players not loaded yet", {
//         voiceLoaded: voiceStatus.isLoaded,
//         bgmLoaded: bgmStatus.isLoaded,
//       });
//       return;
//     }
//     console.log("pressed play")

//     // if (bgmPlayer.paused && bgmPlayer.currentTime >= bgmPlayer.duration && bgmPlayer.duration > 0) {
//     //   void bgmPlayer.seekTo(0);
//     // }

//     // if (voicePlayer.paused && voicePlayer.currentTime >= voicePlayer.duration && voicePlayer.duration > 0) {
//     //   void voicePlayer.seekTo(0);
//     // }
//     console.log("starting to play")
//     bgmPlayer.play();
//     voicePlayer.play();
//   };

//   const handlePause = () => {
//     voicePlayer.pause();
//     bgmPlayer.pause();
//   };

//   const handleStop = () => {
//     voicePlayer.pause();
//     bgmPlayer.pause();
//     void voicePlayer.seekTo(0);
//     void bgmPlayer.seekTo(0);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{title ?? "Session Player"}</Text>
//       <Text style={styles.meta}>Status: {status}</Text>
//       <Text style={styles.meta}>
//         Voice: {voiceStatus.playing ? "Playing" : "Paused"} | Loaded: {voiceStatus.isLoaded ? "Yes" : "No"}
//       </Text>
//       <Text style={styles.meta}>
//         BGM: {bgmStatus.playing ? "Playing" : "Paused"} | Loaded: {bgmStatus.isLoaded ? "Yes" : "No"}
//       </Text>

//       <View style={styles.timeline}>
//         <Pressable
//           style={styles.progressTrack}
//           onLayout={handleProgressLayout}
//           onPress={handleProgressPress}
//         >
//           <View style={[styles.progressFill, { width: progressPercentage }]} />
//         </Pressable>
//         <View style={styles.timeRow}>
//           <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
//           <Text style={styles.timeText}>{formatTime(duration)}</Text>
//         </View>
//       </View>

//       <View style={styles.actions}>
//         <BaseButton
//           text="Play"
//           onPress={handlePlay}
//           height={48}
//           useIcon={false}
//           isLoading={false}
//         />
//         <BaseButton
//           text="-10s"
//           onPress={handleSkipBackward}
//           height={48}
//           useIcon={false}
//           isLoading={false}
//         />
//         <BaseButton
//           text="+10s"
//           onPress={handleSkipForward}
//           height={48}
//           useIcon={false}
//           isLoading={false}
//         />
//         <BaseButton
//           text="Pause"
//           onPress={handlePause}
//           height={48}
//           useIcon={false}
//           isLoading={false}
//         />
//         <BaseButton
//           text="Stop"
//           onPress={handleStop}
//           height={48}
//           useIcon={false}
//           isLoading={false}
//         />
//       </View>

//       <Text style={styles.label}>Audio URL</Text>
//       <Text style={styles.value}>{audioUrl ?? "No audio URL loaded"}</Text>
//       <Text style={styles.label}>BGM URL</Text>
//       <Text style={styles.value}>{bgmUrl ?? "No bgm URL loaded"}</Text>
//       {error ? <Text style={styles.error}>Failed to load meditation audio endpoint.</Text> : null}
//     </View>
//   );
// };

// export default SessionPlayer;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 24,
//     backgroundColor: "#FFFFFF",
//     justifyContent: "center",
//   },
//   title: {
//     fontFamily: FONTS.figtreeSemiBold,
//     fontSize: 24,
//     marginBottom: 16,
//   },
//   meta: {
//     fontFamily: FONTS.figtreeMedium,
//     fontSize: 14,
//     marginBottom: 8,
//     color: "#8E8E93",
//   },
//   actions: {
//     gap: 12,
//     marginVertical: 20,
//   },
//   timeline: {
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   progressTrack: {
//     width: "100%",
//     height: 10,
//     borderRadius: 999,
//     backgroundColor: "#E5E5EA",
//     overflow: "hidden",
//   },
//   progressFill: {
//     height: "100%",
//     borderRadius: 999,
//     backgroundColor: "#FFA800",
//   },
//   timeRow: {
//     marginTop: 8,
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   timeText: {
//     fontFamily: FONTS.figtreeMedium,
//     fontSize: 13,
//     color: "#8E8E93",
//   },
//   label: {
//     fontFamily: FONTS.figtreeSemiBold,
//     fontSize: 16,
//     marginBottom: 8,
//   },
//   value: {
//     fontFamily: FONTS.figtreeMedium,
//     fontSize: 14,
//     color: "#444444",
//     marginBottom: 20,
//   },
//   error: {
//     fontFamily: FONTS.figtreeMedium,
//     fontSize: 14,
//     color: "#B3261E",
//   },
// });


const SessionPlayer = () => {
    return (
        <View>
            
        </View>
    )
}

export default SessionPlayer;

const styles = StyleSheet.create({
    container:{
        fontSize:20
    }
})