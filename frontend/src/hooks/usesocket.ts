import { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL;
const WS_URL = apiUrl
  ? apiUrl.replace(/^https/, "wss").replace(/^http/, "ws")
  : "ws://localhost:8080";

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setSocket(ws);
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, []);

  return socket;
};
