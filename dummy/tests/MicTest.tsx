import { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Alert, Text } from 'react-native';
import {
  useAudioRecorder,
  useAudioPlayer,
  useAudioPlayerStatus,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from 'expo-audio';
import { useSpeechToTextService } from '@/services/useSpeechToTextService';

export default function MicTest() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [playbackUri, setPlaybackUri] = useState<string | null>(null);
  const [lastConvertedUri, setLastConvertedUri] = useState<string | null>(null);
  const player = useAudioPlayer(playbackUri);
  const playerStatus = useAudioPlayerStatus(player);
  const { status: speechStatus, result: speechResult, error: speechError, convertAudioToText } =
    useSpeechToTextService();

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
    if (!playbackUri || !playerStatus.didJustFinish) {
      return;
    }

    if (lastConvertedUri === playbackUri) {
      return;
    }

    setLastConvertedUri(playbackUri);
    const result =  convertAudioToText({
      uri: playbackUri,
      name: 'recording.m4a',
      type: 'audio/m4a',
    });
    console.log("the result is",result)
  }, [playbackUri, playerStatus.didJustFinish, lastConvertedUri, convertAudioToText]);

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
      <Text style={styles.text}>Speech status: {speechStatus}</Text>
      <Text style={styles.text}>Speech result: {JSON.stringify(speechResult)}</Text>
      <Text style={styles.text}>Speech error: {speechError ? String(speechError) : 'None'}</Text>
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
  text: {
    marginTop: 12,
    fontSize: 12,
  },
});
