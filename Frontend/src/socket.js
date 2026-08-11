import { io } from "socket.io-client";

console.log("🔥 socket.js loaded");

const SOCKET_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

console.log("🔌 Socket URL:", SOCKET_URL);

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("✅ SOCKET CONNECTED:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("❌ SOCKET CONNECTION ERROR:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 SOCKET DISCONNECTED:", reason);
});

export const connectSocket = (token) => {
  console.log("🚀 connectSocket() called");

  if (!token) {
    console.error("❌ No JWT token found");
    return;
  }

  console.log("🔑 JWT exists");

  socket.auth = {
    token,
  };

  if (!socket.connected) {
    console.log("🔌 Connecting socket...");
    socket.connect();
  } else {
    console.log("ℹ️ Socket is already connected");
  }
};

export const disconnectSocket = () => {
  console.log("🛑 disconnectSocket() called");

  if (socket.connected) {
    socket.disconnect();
  }
};
