import { io } from "socket.io-client";

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  if (window.location.port === "5173") {
    return "http://localhost:5000";
  }

  return window.location.origin;
};

let socket = null;

export const connectSocket = (token) => {
  if (!token) {
    return null;
  }

  if (socket) {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  socket = io(getSocketUrl(), {
    auth: { token },
    autoConnect: false,
    transports: ["websocket", "polling"],
    withCredentials: true,
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  socket.connect();
  return socket;
};

export const disconnectSocket = () => {
  if (!socket) {
    return;
  }

  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
};

export const getSocket = () => socket;
