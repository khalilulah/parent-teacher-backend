const express = require("express");
const { verifyToken, verifyRole } = require("../utils/utilFunctions");
const { getUserChats, getAllUsers } = require("../controllers/chatControllers");
const router = express.Router();

// Default password change  Route
router.get("/:chatId", verifyToken, getUserChats);

// Route to get users
router.get("/list/users", verifyRole(["teacher"]), getAllUsers);

module.exports = router;
