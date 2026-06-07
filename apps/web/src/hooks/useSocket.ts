import type {
  BattleSnapshot,
  ChatMessageView,
  ClientSocketMessage,
  ServerSocketMessage
} from "@sehemistan/contracts";
import { useCallback, useEffect, useRef, useState } from "react";

const WS_URL = import.meta.env.VITE_WS_URL
  ?? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;

export function useSocket(token: string | null, initialRoom = "global") {
  const socketRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const [status, setStatus] = useState<"offline" | "connecting" | "online">("offline");
  const [messages, setMessages] = useState<ChatMessageView[]>([]);
  const [battle, setBattle] = useState<BattleSnapshot | null>(null);
  const [presence, setPresence] = useState(0);

  const send = useCallback((message: ClientSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      setStatus("connecting");
      const socket = new WebSocket(
        `${WS_URL}/ws?token=${encodeURIComponent(token)}&room=${encodeURIComponent(initialRoom)}`
      );
      socketRef.current = socket;

      socket.onopen = () => {
        retryRef.current = 0;
        setStatus("online");
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data as string) as ServerSocketMessage;
        if (message.type === "history") {
          setMessages(message.messages);
          if (message.battle) setBattle(message.battle);
        } else if (message.type === "chat.message") {
          setMessages((current) => [...current.slice(-99), message.message]);
        } else if (message.type === "battle.update") {
          setBattle(message.battle);
        } else if (message.type === "presence") {
          setPresence(message.count);
        }
      };

      socket.onclose = () => {
        if (cancelled) return;
        setStatus("offline");
        const delay = Math.min(15_000, 800 * 2 ** retryRef.current);
        retryRef.current += 1;
        timerRef.current = window.setTimeout(connect, delay + Math.random() * 400);
      };
    };

    connect();
    const keepAlive = window.setInterval(() => {
      send({ type: "ping", sentAt: Date.now() });
    }, 20_000);

    return () => {
      cancelled = true;
      window.clearInterval(keepAlive);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      socketRef.current?.close();
    };
  }, [initialRoom, send, token]);

  return { status, messages, battle, presence, send };
}
