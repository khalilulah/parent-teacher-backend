const express = require("express");
const { verifyToken } = require("../utils/utilFunctions");
const { getUserChats } = require("../controllers/chatControllers");
const router = express.Router();

// Default password change  Route
router.get("/:userId/:otherUserId", verifyToken, getUserChats);

module.exports = router;
