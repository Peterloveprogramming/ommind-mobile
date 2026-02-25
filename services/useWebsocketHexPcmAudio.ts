import { useCallback, useEffect, useRef, useState } from "react";
import {
  ConnectionStatus,
  PlayAudioInput,
  WebsocketHexPcmAudioService,
  WebsocketHexPcmAudioServiceOptions,
} from "@/services/websocketHexPcmAudioService";

type UseWebsocketHexPcmAudioOptions = Omit<WebsocketHexPcmAudioServiceOptions, "onStatusChange"> & {
  autoDispose?: boolean;
  onStatusChange?: (status: ConnectionStatus) => void;
};

export function useWebsocketHexPcmAudio(options: UseWebsocketHexPcmAudioOptions = {}) {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const serviceRef = useRef<WebsocketHexPcmAudioService | null>(null);

  if (!serviceRef.current) {
    serviceRef.current = new WebsocketHexPcmAudioService({
      ...options,
      onStatusChange: (nextStatus) => {
        setStatus(nextStatus);
        options.onStatusChange?.(nextStatus);
      },
    });
  }

  const connect = useCallback(async () => {
    await serviceRef.current?.connect();
  }, []);

  const playAudio = useCallback(async (input: PlayAudioInput) => {
    await serviceRef.current?.playAudio(input);
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
    connect,
    playAudio,
    disconnect,
    dispose,
    service: serviceRef.current,
  };
}
