import React, { useEffect, useRef, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { WS_URL } from "@/constant";

type ConnectionStatus = "idle" | "connecting" | "open" | "closed" | "error";
type RNWebSocketCtor = new (
  url: string,
  protocols?: string | string[] | null,
  options?: { headers?: Record<string, string> }
) => WebSocket;

const Index = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const connect = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    setStatus("connecting");
    const socket = new (WebSocket as unknown as RNWebSocketCtor)(WS_URL, undefined, {
      headers: {
        Authorization: "Ommind2026",
      },
    });
    wsRef.current = socket;

    socket.onopen = () => {
      setStatus("open");
      setMessages((prev) => [...prev, "[system] connected"]);
    };

    socket.onmessage = (event) => {
      const text = typeof event.data === "string" ? event.data : JSON.stringify(event.data);
      setMessages((prev) => [...prev, `[server] ${text}`]);
    };

    socket.onerror = () => {
      setStatus("error");
      setMessages((prev) => [...prev, "[system] socket error"]);
    };

    socket.onclose = () => {
      setStatus("closed");
      setMessages((prev) => [...prev, "[system] disconnected"]);
    };
  };

  const disconnect = () => {
    wsRef.current?.close();
    wsRef.current = null;
  };

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setMessages((prev) => [...prev, "[system] socket is not connected"]);
      return;
    }

    wsRef.current.send(trimmed);
    setMessages((prev) => [...prev, `[you] ${trimmed}`]);
    setInput("");
  };

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WebSocket Boilerplate</Text>
      <Text style={styles.subtitle}>Status: {status}</Text>

      <View style={styles.actions}>
        <Button title="Connect" onPress={connect} />
        <Button title="Disconnect" onPress={disconnect} />
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type message..."
          autoCapitalize="none"
        />
        <Button title="Send" onPress={sendMessage} />
      </View>

      <ScrollView style={styles.log}>
        {messages.map((message, index) => (
          <Text key={`${message}-${index}`} style={styles.logText}>
            {message}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

export default Index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  log: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    padding: 10,
  },
  logText: {
    fontSize: 14,
    marginBottom: 8,
  },
});
