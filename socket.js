const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Conversation = require("./models/conversationSchema");
const Message = require("./models/messageSchema");
const { Jwt_secret } = require("./keys");

module.exports = server => {
  const io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL || "http://localhost:5000",
        "http://localhost:5173",
      ],
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication token is required"));

      socket.user = jwt.verify(token, Jwt_secret);
      next();
    } catch (e) {
      next(new Error("Invalid authentication token"));
    }
  });

  io.on("connection", socket => {
    const userId = socket.user._id.toString();
    socket.join(`user:${userId}`);

    const getConversationForUser = async conversationId => {
      if (!mongoose.isValidObjectId(conversationId)) {
        return null;
      }

      return Conversation.findOne({
        _id: conversationId,
        participants: userId,
      }).select("_id participants");
    };

    socket.on("join_conversation", async ({ conversationId }) => {
      try {
        const conversation = await getConversationForUser(conversationId);

        if (!conversation) {
          return socket.emit("conversation_error", {
            error: "You are not a member of this conversation",
          });
        }

        socket.join(`conversation:${conversationId}`);
        socket.emit("conversation_joined", { conversationId });
      } catch (error) {
        socket.emit("conversation_error", {
          error: "Unable to join the conversation",
        });
      }
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

        const conversation = await getConversationForUser(conversationId);

        if (!conversation) {
          return socket.emit("message_error", {
            error: "You are not a member of this conversation",
          });
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          text: text.trim()
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          $set: { updatedAt: new Date() },
        });

        // Ensure the sender receives their own persisted message as well.
        socket.join(`conversation:${conversationId}`);
        await message.populate("sender", "_id name userName Photo");

        const participantRooms = conversation.participants.map(
          participant => `user:${participant.toString()}`
        );

        io.to([`conversation:${conversationId}`, ...participantRooms]).emit(
          "new_message",
          message.toObject()
        );

      } catch (error) {
        console.error(error);

        socket.emit("message_error", {
          error: "Failed to send message"
        });
      }
    });


    socket.on("typing", async ({ conversationId }) => {
      if (await getConversationForUser(conversationId))
        socket.to(`conversation:${conversationId}`).emit("user_typing", { userId });
    });

    socket.on("stop_typing", async ({ conversationId }) => {
      if (await getConversationForUser(conversationId))
        socket.to(`conversation:${conversationId}`).emit("user_stopped_typing", { userId });
    });

    socket.on("disconnect", reason => {
      // Normal lifecycle event when user refreshes, closes tab, or navigates away.
      if (reason === "transport close" || reason === "client namespace disconnect") {
        console.log(`Socket: User ${userId} session closed (normal page refresh/nav)`);
      } else {
        console.log(`Socket: User ${userId} disconnected: ${reason}`);
      }
    });
  });

  return io;
};
