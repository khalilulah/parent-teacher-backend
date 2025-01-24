const express = require("express");
const {
  registerUser,
  loginUser,
  createParentAccount, // New function for teachers to create parents
} = require("../controllers/userController");
const verifyRole = require("../middlewares/verifyRole");

const router = express.Router();

// Public Routes
router.post("/register", registerUser); // Registration is open for all
router.post("/login", loginUser); // Login is open for all

// Protected Routes
router.post(
  "/create-parent", 
  verifyRole(["teacher"]), // Only teachers can create parent accounts
  createParentAccount
);

router.get(
  "/teacher-dashboard",
  verifyRole(["teacher"]), // Only teachers can access this route
  (req, res) => {
    res.send("Welcome to the Teacher Dashboard!");
  }
);

router.get(
  "/parent-dashboard",
  verifyRole(["parent"]), // Only parents can access this route
  (req, res) => {
    res.send("Welcome to the Parent Dashboard!");
  }
);

router.get(
  "/shared-dashboard",
  verifyRole(["teacher", "parent"]), // Both teachers and parents can access
  (req, res) => {
    res.send("Welcome to the Shared Dashboard!");
  }
);

module.exports = router;
