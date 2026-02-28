// import React, { useState } from "react";
// import { Alert, Button, Text, TextInput, View } from "react-native";
// import { useWebsocketHexPcmAudio } from "@/services/useWebsocketHexPcmAudio";

// export default function Explore() {
//   const [input, setInput] = useState("hello world");
//   const { status, playAudio, disconnect } = useWebsocketHexPcmAudio();

//   const handlePlayAudio = async () => {
//     try {
//       await playAudio(input);
//     } catch (error) {
//       Alert.alert("Play audio failed", String(error));
//     }
//   };

//   const handleDisconnect = () => {
//     disconnect();
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: "center", padding: 16, gap: 12 }}>
//       <Text>Status: {status}</Text>
//       <TextInput
//         value={input}
//         onChangeText={setInput}
//         placeholder="Type text to stream..."
//         autoCapitalize="none"
//         style={{
//           borderWidth: 1,
//           borderColor: "#ccc",
//           borderRadius: 8,
//           paddingHorizontal: 10,
//           paddingVertical: 8,
//         }}
//       />
//       <Button onPress={handlePlayAudio} title="Play Audio" />
//       <Button onPress={handleDisconnect} title="Disconnect" />
//     </View>
//   );
// }



import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Explore = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coming Soon</Text>
    </View>
  );
};

export default Explore

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
});
