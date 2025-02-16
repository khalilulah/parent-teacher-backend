const express = require("express");
const { verifyToken, verifyRole } = require("../utils/utilFunctions");
const {
  getUserChats,
  getAllUsers,
  createGroupChat,
  addUsersToGroup,
  getUserGroups,
  renameGroup,
  modifyGroupUsers,
  deleteGroup,
} = require("../controllers/chatControllers");
const router = express.Router();

// Default password change  Route
router.get("/:chatId", verifyToken, getUserChats);

// Route to get users
router.get("/list/users", verifyRole(["teacher"]), getAllUsers);

// Route to get group chats
router.get("/list/groups", verifyRole(["teacher"]), getUserGroups);

// Route to create group chat
router.post("/createGroup", verifyRole(["teacher"]), createGroupChat);

// Add users group chat
router.post("/addUsers", verifyRole(["teacher"]), addUsersToGroup);

// Route to rename a group
router.put("/renameGroup", verifyRole(["teacher"]), renameGroup);

// Modify group users (Add or Remove)
router.put("/modifyGroupUsers", verifyRole(["teacher"]), modifyGroupUsers);

// Route to delete a group
router.delete("/deleteGroup", verifyRole(["teacher"]), deleteGroup);

module.exports = router;
