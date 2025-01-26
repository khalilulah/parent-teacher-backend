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

    const { userId, otherUserId } = req.params;

    // Validate required fields
    if (!userId || !otherUserId) {
      return sendResponse(
        res,
        400,
        "Please provide all required parameters",
        null
      );
    }

    // Query DB for specific shats
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    }).sort({ timestamp: 1 });

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
// End of function to create a new organization

module.exports = { getUserChats };
