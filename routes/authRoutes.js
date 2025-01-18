const express = require("express");
const { registerUser } = require("../controllers/userController");
const {
  register,
  login,
  addOrganizationAdmin,
} = require("../controllers/authControllers");
const { verifyRole } = require("../utils/utilFunctions");
const router = express.Router();

// Route to add a super admin
router.post("/register/super", verifyRole(["superAdmin"]), register); // Route to add a super admin

// Route to add an organisation admin
router.post(
  "/register/organizationAdmin",
  verifyRole(["superAdmin"]),
  addOrganizationAdmin
);
router.post("/login", login);

module.exports = router;
