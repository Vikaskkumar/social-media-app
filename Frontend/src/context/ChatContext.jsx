/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useLogin } from "./LoginContext";
import { connectSocket, getSocket } from "../socket/socket";

const ChatContext = createContext(null);

const getConversationId = (message) =>
  typeof message.conversation === "object"
    ? message.conversation?._id
    : message.conversation;

export const ChatProvider = ({ children }) => {
  const { token } = useLogin();
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [socketError, setSocketError] = useState("");

  useEffect(() => {
    const socket = connectSocket(token);

    if (!socket) return;

    const handleNewMessage = (message) => {
      if (
        activeConversation?._id &&
        getConversationId(message) !== activeConversation._id
      ) {
        return;
      }

      setMessages((prev) => {
        if (message._id && prev.some((item) => item._id === message._id)) {
          return prev;
        }

        return [...prev, message];
      });
    };

    const handleUserTyping = ({ userId }) => {
      setTypingUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      );
    };

    const handleUserStoppedTyping = ({ userId }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== userId));
    };

    const handleSocketError = ({ error }) => {
      setSocketError(error || "Chat connection error");
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stopped_typing", handleUserStoppedTyping);
    socket.on("conversation_error", handleSocketError);
    socket.on("message_error", handleSocketError);

    if (activeConversation?._id) {
      socket.emit("join_conversation", {
        conversationId: activeConversation._id,
      });
    }

    return () => {
      if (activeConversation?._id) {
        socket.emit("leave_conversation", {
          conversationId: activeConversation._id,
        });
      }

      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stopped_typing", handleUserStoppedTyping);
      socket.off("conversation_error", handleSocketError);
      socket.off("message_error", handleSocketError);
    };
  }, [token, activeConversation?._id]);

  const sendMessage = ({ conversationId, text }) => {
    const socket = getSocket();

    if (!socket || !conversationId || !text?.trim()) {
      return;
    }

    setSocketError("");
    socket.emit("send_message", {
      conversationId,
      text: text.trim(),
    });
  };

  const startTyping = (conversationId) => {
    const socket = getSocket();

    if (socket && conversationId) {
      socket.emit("typing", { conversationId });
    }
  };

  const stopTyping = (conversationId) => {
    const socket = getSocket();

    if (socket && conversationId) {
      socket.emit("stop_typing", { conversationId });
    }
  };

  const value = useMemo(
    () => ({
      messages,
      setMessages,
      activeConversation,
      setActiveConversation,
      typingUsers,
      socketError,
      setSocketError,
      sendMessage,
      startTyping,
      stopTyping,
    }),
    [messages, activeConversation, typingUsers, socketError]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used inside ChatProvider");
  }

  return context;
};
