const Chat = require("../models/chatModel");
const { Guardian } = require("../models/guardianModel");
const Message = require("../models/messageModel");
const Organization = require("../models/organizationModel");
const { Teacher } = require("../models/teacherModel");
const { sendResponse } = require("../utils/utilFunctions");
const { v4: uuidv4 } = require("uuid"); // For generating unique chat IDs

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

// Function to get all users
const getAllUsers = async (req, res) => {
  try {
    // Get user data from token
    const { userData } = req.userData;

    // Validate request (Additional validation just in case)
    if (!userData) {
      return sendResponse(res, 401, "Please login to continue", null);
    }

    const userId = userData?._id;

    // Fetch user's guardians
    const users = await Guardian.find({ teachers: { $in: [userId] } });

    return sendResponse(res, 200, "Users successfully fetched", users);
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

// Function to create group chat
const createGroupChat = async (req, res) => {
  try {
    // Get user data from token
    const { userData } = req.userData;

    // Validate request (Additional validation just in case)
    if (!userData) {
      return sendResponse(res, 401, "Please login to continue");
    }

    const { groupName, participantIds } = req.body;

    // Validate whom is creating a group chat
    if (userData.role !== "teacher") {
      return sendResponse(res, 403, "Only teachers can create groups", null);
    }

    // Validate required fields
    if (!groupName || !participantIds?.length) {
      return sendResponse(
        res,
        400,
        "Group name and participants are required",
        null
      );
    }

    // Create new chat
    const newChat = new Chat({
      chatId: uuidv4(),
      participants: [userData._id, ...participantIds],
      type: "group",
      name: groupName,
    });

    // Save chat and send response
    await newChat.save();
    return sendResponse(res, 200, "Group chat created successfully", newChat);
  } catch (error) {
    console.error("Error creating group:", error);
    return sendResponse(res, 500, "Internal Server Error", null);
  }
};
// End of function to create group chat

// Add users to the group chat
const addUsersToGroup = async (req, res) => {
  try {
    const { userData } = req.userData;
    const { chatId, newParticipantIds } = req.body; // Expect an array of IDs

    if (
      !chatId ||
      !Array.isArray(newParticipantIds) ||
      newParticipantIds.length === 0
    ) {
      return sendResponse(
        res,
        400,
        "Chat ID and a list of participant IDs are required",
        null
      );
    }

    const chat = await Chat.findOne({ chatId });

    if (!chat || chat.type !== "group") {
      return sendResponse(res, 404, "Group chat not found", null);
    }

    if (!chat.participants.includes(userData._id)) {
      return sendResponse(res, 403, "Only group members can add users", null);
    }

    // Filter out existing participants
    const newUsers = newParticipantIds.filter(
      (id) => !chat.participants.includes(id)
    );

    if (newUsers.length === 0) {
      return sendResponse(res, 400, "All users are already in the group", null);
    }

    chat.participants.push(...newUsers);
    await chat.save();

    return sendResponse(res, 200, "Users added to group successfully", chat);
  } catch (error) {
    console.error("Error adding users to group:", error);
    return sendResponse(res, 500, "Internal Server Error", null);
  }
};

// End of function to add a user or users to the group chat

// Fetch all group chats a user is part of
const getUserGroups = async (req, res) => {
  try {
    const { userData } = req.userData; // Get logged-in user ID

    if (!userData?._id) {
      return sendResponse(res, 400, "User ID is required", null);
    }

    // Find all group chats where the user is a participant
    const groups = await Chat.find({
      type: "group",
      participants: userData._id,
    })
      .populate("participants")
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, "User groups fetched successfully", groups);
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return sendResponse(res, 500, "Internal Server Error", null);
  }
};
// End of function to fetch all group chats a user is a part of

// Function to rename a group
const renameGroup = async (req, res) => {
  try {
    const { userData } = req.userData; // Get logged-in user ID
    const { chatId, newName } = req.body;

    if (!chatId || !newName) {
      return sendResponse(res, 400, "Chat ID and new name are required", null);
    }

    const chat = await Chat.findOne({ chatId });

    if (!chat || chat.type !== "group") {
      return sendResponse(res, 404, "Group chat not found", null);
    }

    if (!chat.participants.includes(userData._id)) {
      return sendResponse(
        res,
        403,
        "Only group members can rename the group",
        null
      );
    }

    chat.name = newName;
    await chat.save();

    return sendResponse(res, 200, "Group renamed successfully", chat);
  } catch (error) {
    console.error("Error renaming group:", error);
    return sendResponse(res, 500, "Internal Server Error", null);
  }
};
// End of function to rename a group

// Function to modify group users
const modifyGroupUsers = async (req, res) => {
  try {
    const { userData } = req.userData;
    const { chatId, userId, action } = req.body; // userId is now a single value

    if (!chatId || !userId || !action) {
      return sendResponse(
        res,
        400,
        "Chat ID, user ID, and action (add/remove) are required",
        null
      );
    }

    const chat = await Chat.findOne({ chatId });

    if (!chat || chat.type !== "group") {
      return sendResponse(res, 404, "Group chat not found", null);
    }

    // Ensure only the group creator can modify users
    if (chat.participants[0].toString() !== userData._id) {
      return sendResponse(
        res,
        403,
        "Only the group creator can modify users",
        null
      );
    }

    if (action === "add") {
      // Check if user is already in the group
      if (chat.participants.includes(userId)) {
        return sendResponse(res, 400, "User is already in the group", null);
      }
      chat.participants.push(userId);
    } else if (action === "remove") {
      // Check if the user is in the group
      if (!chat.participants.includes(userId)) {
        return sendResponse(res, 400, "User is not in the group", null);
      }
      chat.participants = chat.participants.filter(
        (id) => id.toString() !== userId
      );
    } else {
      return sendResponse(
        res,
        400,
        "Invalid action. Use 'add' or 'remove'.",
        null
      );
    }

    await chat.save();

    return sendResponse(
      res,
      200,
      `User successfully ${
        action === "add" ? "added to" : "removed from"
      } the group`,
      chat
    );
  } catch (error) {
    console.error("Error modifying group users:", error);
    return sendResponse(res, 500, "Internal Server Error", null);
  }
};

// End of function to modify group users

module.exports = {
  getUserChats,
  modifyGroupUsers,
  getUserGroups,
  getOrCreateChat,
  getAllUsers,
  createGroupChat,
  addUsersToGroup,
  renameGroup,
};
