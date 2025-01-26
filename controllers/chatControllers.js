const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const Organization = require("../models/organizationModel");
const { sendResponse } = require("../utils/utilFunctions");

// Function to get chats between two users
const getUserChats = async (req, res) => {
  try {
    // Get user data from token
    const { userData } = req.userData;

    // Validate request (Additional validation just in case)
    if (!userData) {
      return sendResponse(res, 401, "Please login to continue", null);
    }

    const { chatId } = req.params;

    // Validate required fields
    if (!chatId) {
      return sendResponse(
        res,
        400,
        "Please provide all required parameters",
        null
      );
    }

    // Query DB for specific shats
    const messages = await Message.find({ chatId }).sort({ timestamp: 1 });
    console.log(messages);
    return sendResponse(res, 200, "Messages successfully fetched", messages);
  } catch (error) {
    console.error("Could not fetch messages:", error);
    return sendResponse(
      res,
      500,
      error?.message || error || "Internal Server Error",
      null
    );
  }
};
// End of function to get chats between two users

// Controller to create or fetch a chat
const getOrCreateChat = async (req, res) => {
  const { participantIds } = req.body; // Array of user IDs
  const sortedIds = participantIds.sort(); // Ensure consistent order

  try {
    // Check if a chat with these participants exists
    let chat = await Chat.findOne({ participants: sortedIds });

    if (!chat) {
      // If not, create a new chat
      const chatId = uuidv4();
      chat = new Chat({
        chatId,
        participants: sortedIds,
      });
      await chat.save();
    }

    return sendResponse(res, 200, "Chat successfully fetched", chat);
  } catch (error) {
    console.error("Could not fetch messages:", error);
    return sendResponse(
      res,
      500,
      error?.message || error || "Internal Server Error",
      null
    );
  }
};

module.exports = { getUserChats, getOrCreateChat };
