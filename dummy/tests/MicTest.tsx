import { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import {
  useAudioRecorder,
  useAudioPlayer,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from 'expo-audio';

export default function MicTest() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [playbackUri, setPlaybackUri] = useState<string | null>(null);
  const player = useAudioPlayer(playbackUri);

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
    // The recording will be available on `audioRecorder.uri`.
    await audioRecorder.stop();
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
    });

    const recordedUri = audioRecorder.uri ?? recorderState.url ?? null;
    console.log('Recorded audio URL:', recordedUri);
    if (!recordedUri) {
      return;
    }

    setPlaybackUri(recordedUri);
  };

  useEffect(() => {
    if (!playbackUri) {
      return;
    }

    player.seekTo(0);
    player.play();
  }, [playbackUri, player]);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone was denied');
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Button
        title={recorderState.isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={recorderState.isRecording ? stopRecording : record}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
  },
});
