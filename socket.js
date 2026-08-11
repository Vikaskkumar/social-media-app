const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

module.exports = server => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication token is required"));

      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (e) {
      next(new Error("Invalid authentication token"));
    }
  });

  io.on("connection", socket => {
    const userId = socket.user.id;
    socket.join(`user:${userId}`);

    socket.on("join_conversation", async ({ conversationId }) => {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId
      });

      if (!conversation) {
        return socket.emit("conversation_error", {
          error: "You are not a member of this conversation"
        });
      }

      socket.join(`conversation:${conversationId}`);
    });


    socket.on("leave_conversation", ({ conversationId }) => {
      if (conversationId) socket.leave(`conversation:${conversationId}`);
    });

    socket.on("send_message", async ({ conversationId, text }) => {
      try {
        if (!conversationId) {
          return socket.emit("message_error", {
            error: "Conversation ID is required"
          });
        }

        if (!text?.trim()) {
          return socket.emit("message_error", {
            error: "Message cannot be empty"
          });
        }

        // 1. Verify user belongs to conversation

        // 2. Save message to database
        const message = await Message.create({
          conversationId,
          sender: userId,
          text: text.trim()
        });

        // 3. Broadcast saved message
        io.to(`conversation:${conversationId}`).emit(
          "new_message",
          message
        );

      } catch (error) {
        console.error(error);

        socket.emit("message_error", {
          error: "Failed to send message"
        });
      }
    });


    socket.on("typing", ({ conversationId }) => {
      if (conversationId)
        socket.to(`conversation:${conversationId}`).emit("user_typing", { userId });
    });

    socket.on("stop_typing", ({ conversationId }) => {
      if (conversationId)
        socket.to(`conversation:${conversationId}`).emit("user_stopped_typing", { userId });
    });

    socket.on("disconnect", reason => {
      console.log(`User ${userId} disconnected: ${reason}`);
    });
  });

  return io;
};