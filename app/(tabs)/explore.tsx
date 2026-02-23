import React from 'react';
import { View, Button } from 'react-native';
import { AudioContext } from 'react-native-audio-api';

export default function Explore() {
  const handlePlay = async () => {
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const playerNode = audioContext.createBufferSource();
    playerNode.buffer = audioBuffer;

    playerNode.connect(audioContext.destination);
    playerNode.start(audioContext.currentTime);
    playerNode.stop(audioContext.currentTime + 10);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button onPress={handlePlay} title="Play sound!" />
    </View>
  );
}