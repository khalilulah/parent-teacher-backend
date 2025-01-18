const express = require("express");
const { registerUser } = require("../controllers/userController");
const { register, login } = require("../controllers/authControllers");
const router = express.Router();

// Reguster super admin
router.post("/register/super", register);
router.post("/login", login);

module.exports = router;
