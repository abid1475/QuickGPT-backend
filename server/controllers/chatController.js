import Chat from "../models/chat.js";
import User from "../models/user.js";

// ================= SEND MESSAGE (Text & Image) =================
import { textMessageController } from './messageController.js';
import { imageMessageController } from './messageController.js';


export const sendMessage = async (req, res) => {
  const { mode } = req.params;

  console.log(`[sendMessage] Mode received: ${mode}`);

  try {
    if (mode === 'text') {
      return await textMessageController(req, res);
    } 
    else if (mode === 'image') {
      return await imageMessageController(req, res);
    } 
    else {
      return res.status(400).json({
        success: false,
        message: `Invalid mode: ${mode}. Use 'text' or 'image'`
      });
    }
  } catch (error) {
    console.error(`[sendMessage Error] Mode: ${mode}`, error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in sendMessage",
      error: error.message
    });
  }
};

// ================= CHAT MANAGEMENT =================

export const createChat = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { title = "New Chat" } = req.body;

    const newChat = await Chat.create({
      userId,
      title,
      messages: []
    });

    res.json({
      success: true,
      chat: newChat
    });
  } catch (error) {
    console.error("Create Chat Error:", error);
    
    // Better error response
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create chat",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getChats = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const chats = await Chat.find({ userId })
      .sort({ updatedAt: -1 })
      .select('title updatedAt');

    res.json({
      success: true,
      chats
    });
  } catch (error) {
    console.error("Get Chats Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteChats = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { chatId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!chatId) {
      return res.status(400).json({ success: false, message: "chatId is required" });
    }

    const deleted = await Chat.findOneAndDelete({ _id: chatId, userId });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    res.json({
      success: true,
      message: "Chat deleted successfully"
    });
  } catch (error) {
    console.error("Delete Chat Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};