import Chat from "../models/chat.js";
import User from "../models/user.js";
import imageKit from "../configs/imageKit.js";
import axios from "axios";
import openai from "../configs/openai.js";

// ================= TEXT MESSAGE CONTROLLER =================

export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check credits
    if (req.user.credits < 1) {
      return res.json({
        success: false,
        message: "You don't have enough credits to use this feature",
      });
    }

    const { chatId, prompt, isPublished } = req.body;

    // Find chat
    const chat = await Chat.findOne({
      userId,
      _id: chatId,
    });

    // Check if chat exists
    if (!chat) {
      return res.json({
        success: false,
        message: "Chat not found",
      });
    }

    // Save user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    }); 

    // AI Response
   const {choices} = await openai.chat.completions.create({
    model: "gemini-3.5-flash",
    messages: [
        {   role: "system",
            content: "You are a helpful assistant." 
        },
        { 
            // role: "user",
            // content: "Explain to me how AI works",
             role: "user",
             content: prompt,
        },
    ],
}); 

    // Assistant reply
    const rply = {
      ...choices[0].message,
      timestamp: Date.now(),
      isImage: false,
    };

    // Save assistant reply
    chat.messages.push(rply);

    // Save chat
    await chat.save();

    // Deduct credit
    await User.updateOne(
      { _id: userId },
      { $inc: { credits: -1 } }
    );

    // Response
    res.json({
      success: true,
      rply,
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// ================= IMAGE MESSAGE CONTROLLER =================

export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check credits
    if (req.user.credits < 1) {
      return res.json({
        success: false,
        message: "You don't have enough credits to use this feature",
      });
    }

    const { prompt, chatId, isPublished} = req.body;

    // Find chat
    const chat = await Chat.findOne({
      userId,
      _id: chatId,
    });

    // Check if chat exists
    if (!chat) {
      return res.json({
        success: false,
        message: "Chat not found",
      });
    }

    // Save user prompt
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // Encode prompt
    const encodedPrompt = encodeURIComponent(prompt);

    // Generate image URL
    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

    // Get image
    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });

    // Convert image to base64
    const base64Image = `data:image/png;base64,${Buffer.from(
      aiImageResponse.data,
      "binary"
    ).toString("base64")}`;

    // Upload image to ImageKit
    const uploadResponse = await imageKit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "Ai_models",
    });

    // Assistant image reply
    const rply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    // Save assistant image reply
    chat.messages.push(rply);

    // Save chat
    await chat.save();

    // Deduct credits
    await User.updateOne(
      { _id: userId },
      { $inc: { credits: -2 } }
    );

    // Send response
    res.json({
      success: true,
      rply,
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};