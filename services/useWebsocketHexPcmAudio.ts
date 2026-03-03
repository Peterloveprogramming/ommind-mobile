import { useCallback, useEffect, useRef, useState } from "react";
import {
  ConnectionStatus,
  PlayAudioInput,
  WebsocketHexPcmAudioService,
  WebsocketHexPcmAudioServiceOptions,
} from "@/services/websocketHexPcmAudioService";
import { PlaybackStatus } from "@/services/hexPcmAudioPlayer";

type UseWebsocketHexPcmAudioOptions = Omit<WebsocketHexPcmAudioServiceOptions, "onStatusChange"> & {
  autoDispose?: boolean;
  onStatusChange?: (status: ConnectionStatus) => void;
  onPlaybackStatusChange?: (status: PlaybackStatus) => void;
};

export function useWebsocketHexPcmAudio(options: UseWebsocketHexPcmAudioOptions = {}) {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>("idle");
  const serviceRef = useRef<WebsocketHexPcmAudioService | null>(null);

  if (!serviceRef.current) {
    serviceRef.current = new WebsocketHexPcmAudioService({
      ...options,
      onStatusChange: (nextStatus) => {
        setStatus(nextStatus);
        options.onStatusChange?.(nextStatus);
      },
      onPlaybackStatusChange: (nextPlaybackStatus) => {
        setPlaybackStatus(nextPlaybackStatus);
        options.onPlaybackStatusChange?.(nextPlaybackStatus);
      },
    });
  }

  const connect = useCallback(async () => {
    await serviceRef.current?.connect();
  }, []);

  const playAudio = useCallback(async (input: PlayAudioInput) => {
    await serviceRef.current?.playAudio(input);
  }, []);

  const pause = useCallback(async () => {
    await serviceRef.current?.pause();
  }, []);

  const resume = useCallback(async () => {
    await serviceRef.current?.resume();
  }, []);

  const disconnect = useCallback(() => {
    serviceRef.current?.disconnect();
  }, []);

  const dispose = useCallback(async () => {
    await serviceRef.current?.dispose();
  }, []);

  useEffect(() => {
    if (options.autoDispose === false) return;
    return () => {
      void serviceRef.current?.dispose();
    };
  }, [options.autoDispose]);

  return {
    status,
    playbackStatus,
    connect,
    playAudio,
    pause,
    resume,
    disconnect,
    dispose,
    service: serviceRef.current,
  };
}
