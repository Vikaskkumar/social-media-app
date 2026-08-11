const express = require("express");
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const USER = require("../models/User");
const Conversation = require("../models/conversationSchema");
const Message = require("../models/messageSchema");

const router = express.Router();
const participantFields = "_id name userName Photo";

router.get("/chat/users", requireLogin, async (req, res) => {
  try {
    const users = await USER.find({ _id: { $ne: req.user._id } })
      .select(participantFields)
      .sort({ userName: 1, name: 1 })
      .lean();

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: "Unable to load chat users" });
  }
});

router.get("/chat/conversations", requireLogin, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate("participants", participantFields)
      .sort({ updatedAt: -1 })
      .lean();

    return res.json(conversations);
  } catch (error) {
    return res.status(500).json({ error: "Unable to load conversations" });
  }
});

router.post("/chat/conversations", requireLogin, async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(422).json({ error: "A valid user is required" });
  }

  if (userId === req.user._id.toString()) {
    return res.status(422).json({ error: "You cannot start a chat with yourself" });
  }

  try {
    const recipient = await USER.findById(userId).select("_id");
    if (!recipient) {
      return res.status(404).json({ error: "User not found" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, userId],
      });
    }

    await conversation.populate("participants", participantFields);
    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ error: "Unable to start the conversation" });
  }
});

router.get("/chat/conversations/:conversationId/messages", requireLogin, async (req, res) => {
  const { conversationId } = req.params;

  if (!mongoose.isValidObjectId(conversationId)) {
    return res.status(422).json({ error: "Invalid conversation" });
  }

  try {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    }).select("_id");

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", participantFields)
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ error: "Unable to load messages" });
  }
});

module.exports = router;
