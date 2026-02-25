import React, { useEffect, useRef, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { WS_URL } from "@/constant";

import { AudioContext } from "react-native-audio-api";

// =========================
// ✅ HELPER FUNCTIONS (PCM)
// =========================

function resampleLinear(input: Float32Array, inRate: number, outRate: number) {
  if (inRate === outRate) return input;

  const ratio = outRate / inRate;
  const outLength = Math.max(1, Math.floor(input.length * ratio)); // never 0
  const output = new Float32Array(outLength);

  for (let i = 0; i < outLength; i++) {
    const src = i / ratio;
    const i0 = Math.floor(src);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const frac = src - i0;
    output[i] = input[i0] * (1 - frac) + input[i1] * frac;
  }
  return output;
}

// hex string -> Uint8Array
function hexToUint8Array(hex: string) {
  const clean = hex.trim();
  if (clean.length % 2 !== 0) throw new Error("Invalid hex length");

  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  }
  return bytes;
}

// PCM16 little-endian -> Float32
function pcm16leBytesToFloat32(bytes: Uint8Array) {
  if (bytes.length % 2 !== 0) throw new Error("PCM16 requires even length");

  const sampleCount = bytes.length / 2;
  const floats = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const lo = bytes[i * 2];
    const hi = bytes[i * 2 + 1];

    let s = (hi << 8) | lo;
    if (s & 0x8000) s -= 0x10000; // signed

    floats[i] = s / 32768;
  }

  return floats;
}

type ConnectionStatus = "idle" | "connecting" | "open" | "closed" | "error";
type RNWebSocketCtor = new (
  url: string,
  protocols?: string | string[] | null,
  options?: { headers?: Record<string, string> }
) => WebSocket;

const SAMPLE_RATE = 32000;
const CHANNELS = 1;

const Index = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const queueRef = useRef<any>(null);

  const startedRef = useRef(false);
  const warmupCountRef = useRef(0);
  const WARMUP_CHUNKS = 3;

  // =========================
  // ✅ INIT AUDIO ENGINE
  // =========================
  const ensureAudioEngine = async () => {
    if (audioCtxRef.current && queueRef.current) return;

    const ctx = new AudioContext();
    console.log("AudioContext sampleRate =", ctx.sampleRate);
    const queue = ctx.createBufferQueueSource();

    queue.connect(ctx.destination);

    audioCtxRef.current = ctx;
    queueRef.current = queue;

    startedRef.current = false;
    warmupCountRef.current = 0;
  };

  // =========================
  // ✅ PLAY HEX PCM CHUNK
  // =========================
 const playIncomingHexChunk = async (hex: string) => {
  // ✅ guard empty chunks (fixes 0-frame error)
  if (!hex || hex.length < 4) return;
  if (hex.length % 2 !== 0) return;

  await ensureAudioEngine();

  const ctx = audioCtxRef.current!;
  const queue = queueRef.current!;

  const bytes = hexToUint8Array(hex);
  if (bytes.length < 2) return;

  const floats32k = pcm16leBytesToFloat32(bytes);

  // ✅ RESAMPLE 32000 -> ctx.sampleRate (48000 on your device)
  const floatsOut = resampleLinear(floats32k, 32000, ctx.sampleRate);

  // ✅ create buffer at OUTPUT rate (ctx.sampleRate)
  const audioBuffer = ctx.createBuffer(1, floatsOut.length, ctx.sampleRate);
  audioBuffer.copyToChannel(floatsOut, 0);

  queue.enqueueBuffer(audioBuffer);

  if (!startedRef.current) {
    warmupCountRef.current++;
    if (warmupCountRef.current >= WARMUP_CHUNKS) {
      if (ctx.state !== "running") await ctx.resume();
      queue.start();
      startedRef.current = true;
    }
  }
};
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

    socket.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg?.event === "task_continue" && typeof msg.audio === "string") {
          // 🔥 PLAY HEX PCM DIRECTLY
          await playIncomingHexChunk(msg.audio);
          return;
        }
      } catch (e) {
        console.log("[ws] parse error:", e);
      }
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

    wsRef.current.send(
      JSON.stringify({
        text: trimmed,
        file_format: "pcm",
      })
    );

    setMessages((prev) => [...prev, `[you] ${trimmed}`]);
    setInput("");
  };

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      wsRef.current = null;

      try {
        queueRef.current?.stop?.();
      } catch {}

      audioCtxRef.current?.close?.();

      queueRef.current = null;
      audioCtxRef.current = null;
      startedRef.current = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PCM Streaming (Unity-style)</Text>
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

export default Index;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 40 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 16 },
  actions: { flexDirection: "row", gap: 12, marginBottom: 16 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
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
  logText: { fontSize: 14, marginBottom: 8 },
});