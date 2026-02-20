import { Buffer } from "buffer";
import {
  MicrophoneDataCallback,
  VolumeLevelCallback,
  getMicrophoneModeIOS,
  initialize,
  playPCMData,
  setMicrophoneModeIOS,
  toggleRecording,
  useExpoTwoWayAudioEventListener,
  useIsRecording,
  useMicrophonePermissions,
} from "@speechmatics/expo-two-way-audio";
import { useCallback, useEffect, useState } from "react";
import { Button, Platform, StyleSheet, Text, View } from "react-native";

export default function Explore() {
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  if (!micPermission?.granted) {
    return (
      <View style={styles.container}>
        <Text>Mic permission: {micPermission?.status}</Text>
        <Button
          title={micPermission?.canAskAgain ? "Request permission" : "Cannot request permissions"}
          disabled={!micPermission?.canAskAgain}
          onPress={requestMicPermission}
        />
      </View>
    );
  }

  return <Testbed />;
}

function Testbed() {
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [inputVolumeLevel, setInputVolumeLevel] = useState(0);
  const [outputVolumeLevel, setOutputVolumeLevel] = useState(0);
  const [lastOutputAtMs, setLastOutputAtMs] = useState<number | null>(null);
  const [debugLines, setDebugLines] = useState<string[]>([]);
  const micMode = Platform.OS === "ios" ? getMicrophoneModeIOS() : "NO_MIC_MODE_IN_ANDROID";
  const isRecording = useIsRecording();

  const logDebug = useCallback((line: string) => {
    const stamped = `${new Date().toISOString().slice(11, 19)} ${line}`;
    console.log(`[two-way-audio] ${stamped}`);
    setDebugLines((prev) => [stamped, ...prev].slice(0, 8));
  }, []);

  const playAudio = useCallback(() => {
    logDebug("Play audio tapped");

    if (!audioInitialized) {
      logDebug("Blocked: audio is not initialized yet");
      return;
    }

    let chunkCount = 0;
    let totalBytes = 0;
    const repeatCycles = 250;
    const gain = 4;

    try {
      for (let cycle = 0; cycle < repeatCycles; cycle += 1) {
        for (const dataChunk of audioData) {
          for (const audioChunk of dataChunk.audio) {
            const buffer = Buffer.from(audioChunk, "base64");
            const pcmData = amplifyPcm16Le(new Uint8Array(buffer), gain);
            playPCMData(pcmData);
            chunkCount += 1;
            totalBytes += pcmData.byteLength;
          }
        }
      }
      const estimatedSeconds = totalBytes / 2 / 16000;
      logDebug(
        `Queued ${chunkCount} chunks, ${totalBytes} bytes (~${estimatedSeconds.toFixed(2)}s at PCM16/16k mono)`,
      );
    } catch (error) {
      logDebug(`Playback error: ${String(error)}`);
    }
  }, [audioInitialized, logDebug]);

  const playTestTone = useCallback(() => {
    logDebug("Play test tone tapped");

    if (!audioInitialized) {
      logDebug("Blocked: audio is not initialized yet");
      return;
    }

    try {
      const tone = makeSinePcm16Le({
        sampleRate: 16000,
        frequencyHz: 440,
        seconds: 3.5,
        amplitude: 0.95,
      });
      // Feed tone in 20ms chunks (320 samples => 640 bytes).
      const chunkBytes = 640;
      let chunkCount = 0;
      for (let offset = 0; offset < tone.byteLength; offset += chunkBytes) {
        playPCMData(tone.slice(offset, Math.min(offset + chunkBytes, tone.byteLength)));
        chunkCount += 1;
      }
      logDebug(`Queued test tone: ${tone.byteLength} bytes in ${chunkCount} chunks`);
    } catch (error) {
      logDebug(`Test tone error: ${String(error)}`);
    }
  }, [audioInitialized, logDebug]);

  useExpoTwoWayAudioEventListener(
    "onMicrophoneData",
    useCallback<MicrophoneDataCallback>((event) => {
      console.log(`MIC DATA: ${event.data}`);
    }, []),
  );

  useExpoTwoWayAudioEventListener(
    "onInputVolumeLevelData",
    useCallback<VolumeLevelCallback>((event) => {
      setInputVolumeLevel(event.data);
    }, []),
  );

  useExpoTwoWayAudioEventListener(
    "onOutputVolumeLevelData",
    useCallback<VolumeLevelCallback>((event) => {
      setOutputVolumeLevel(event.data);
      if (event.data > 0.005) {
        setLastOutputAtMs(Date.now());
      }
    }, []),
  );

  useEffect(() => {
    let mounted = true;

    logDebug("Calling initialize()");

    initialize()
      .then(() => {
        if (!mounted) return;
        setAudioInitialized(true);
        setInitError(null);
        logDebug("initialize() success");
      })
      .catch((error) => {
        if (!mounted) return;
        setAudioInitialized(false);
        setInitError(String(error));
        logDebug(`initialize() failed: ${String(error)}`);
      });

    return () => {
      mounted = false;
    };
  }, [logDebug]);

  const handleToggleMute = useCallback(() => {
    logDebug(`toggleRecording(${!isRecording})`);
    toggleRecording(!isRecording);
  }, [isRecording, logDebug]);

  const handleMicToggle = useCallback(() => {
    if (Platform.OS === "ios") {
      logDebug("setMicrophoneModeIOS()");
      setMicrophoneModeIOS();
    } else {
      logDebug("No mic mode in android");
    }
  }, [logDebug]);

  const outputRecentlyActive =
    lastOutputAtMs !== null ? Date.now() - lastOutputAtMs < 1500 : false;

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Play audio" onPress={playAudio} />
        <Button title="Play test tone" onPress={playTestTone} />
        <Button title={isRecording ? "Mute" : "Unmute"} onPress={handleToggleMute} />
        {isRecording && <Button title="Mic mode" onPress={handleMicToggle} />}
      </View>
      <View style={styles.volumeContainer}>
        <Text>{audioInitialized ? "Audio initialized" : "Initializing audio..."}</Text>
        {initError ? <Text>{`init error: ${initError}`}</Text> : null}
        <Text>{`input:${inputVolumeLevel}`}</Text>
        <Text>{`output:${outputVolumeLevel}`}</Text>
        <Text>{outputRecentlyActive ? "Output activity: detected" : "Output activity: not detected"}</Text>
        <Text>{isRecording ? micMode : "ready"}</Text>
        <Text>Debug:</Text>
        {debugLines.map((line, index) => (
          <Text key={`${line}-${index}`}>{line}</Text>
        ))}
      </View>
    </View>
  );
}

const audioData = [
  {
    message: "audio",
    audio: [
      "BAAGAAUAAAACAP7//P8AAAIABwAJAAoAAwD7/////v/6//n/+v8AAPz/+/8GAAMA9f/s//H///8BAP7/AwAFAAIA///5//H/9P/6//f/+P/9/wQABQD5//f/+v/1//P/7//5/wcAAQD+/wIA/v/4//f/9v/x//P/AwAIAAEA/f8BAAUA/P/7//3/AQAJAAYABgAOABUAHgASAAEA+//4////CQAUABYACwAHAAYACwAPAAwACQD///v/DgAfACIAEgAEAAUA/v/0//j/CAASABQAGAAVAAkA+f/5/wQAAQAAABEAIAAeACAAJQAWAPz/6f/u//v/AgASABkAFwAWAA==",
      "BgD3/+7/6f/y//r/AAAPABgADwAEAAIA/f/y/+v/7f/y//f/CAASAAYA9f/1//P/5//l/wAAHQAGAAQAIQAKAOn/2//n/+7/3f/0/w0ABAACAAIA9//X/8z/5P/7/wMA+f8GABEA//8GAP7/6P/o/9z/2v/n/wEAGQD9/+P/5//g/93/4v/u/wQAEAAOAPf/6v/4//z/5P/E/9f/DgAbAA0ACAAfABYA6P/i/+H/6v8GAAQACgAZADAALADi/8D/7v8RAP//5//3/xEAIQAgABYA///k/wYAEADd/+7/IAAjAAEA9v8hABoA8P8AACAAFAAFAC4ANwD5/+P/EgAqAA==",
      "/P/1/ysAEwDP/8j/7/8PAAkAEgAJAOb/BgA1AEQAHADg/9j/6f8FABkAIwAxAB4A4v+y/8//EgAZAAIAEwAzACAA/v/0/+L/zP/a/xMAKQAwAFcAOgDT/5H/lP+a/3X/iP8MAHcAbQBBACoACwDa/6n/of/T/xcAQABIADsARwBMANv/Vv9L/6//FgATABoAUAAzAPv/7f/3/+D/tP/w/y0AGAAkAEQAJAC2/4z/s//V/+z/CAA7AB8AFQBhAEYA8f/T/x8ARADy/+z/JgA2AOT/wf/w/+H/+P8FAOv/7f8OAFwAQwDv//X/AgD0/yMAdQBbAPz/2v///+b/mP/C/w==",
    ],
    utterance_idx: 0,
    text: "Hey there!",
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 50,
    paddingBottom: 50,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
    gap: 8,
  },
  volumeContainer: {
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 16,
    gap: 8,
  },
});

function amplifyPcm16Le(bytes: Uint8Array, gain: number): Uint8Array {
  const out = new Uint8Array(bytes.byteLength);
  out.set(bytes);

  const dv = new DataView(out.buffer, out.byteOffset, out.byteLength);
  for (let i = 0; i + 1 < out.byteLength; i += 2) {
    const sample = dv.getInt16(i, true);
    const amplified = Math.max(-32768, Math.min(32767, Math.round(sample * gain)));
    dv.setInt16(i, amplified, true);
  }
  return out;
}

function makeSinePcm16Le(params: {
  sampleRate: number;
  frequencyHz: number;
  seconds: number;
  amplitude: number;
}): Uint8Array {
  const { sampleRate, frequencyHz, seconds, amplitude } = params;
  const samples = Math.max(1, Math.floor(sampleRate * seconds));
  const out = new Uint8Array(samples * 2);
  const dv = new DataView(out.buffer);

  for (let i = 0; i < samples; i += 1) {
    const t = i / sampleRate;
    const v = Math.sin(2 * Math.PI * frequencyHz * t);
    const s = Math.round(v * amplitude * 32767);
    dv.setInt16(i * 2, s, true);
  }

  return out;
}
