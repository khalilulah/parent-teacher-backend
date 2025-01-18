const express = require("express");
const { registerUser } = require("../controllers/userController");
const { register, login } = require("../controllers/authControllers");
const { verifyToken } = require("../utils/utilFunctions");
const router = express.Router();

// Reguster super admin
router.post("/register/super", verifyToken, register);
router.post("/login", login);

module.exports = router;
