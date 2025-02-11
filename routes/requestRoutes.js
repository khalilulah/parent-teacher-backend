const express = require("express");
const {
  register,
  addOrganizationAdmin,
} = require("../controllers/authControllers");
const { verifyRole } = require("../utils/utilFunctions");
const { getRequests } = require("../controllers/requestControllers");
const router = express.Router();

// Route to add a teacher
router.get("/", verifyRole(["guardian"]), getRequests);

module.exports = router;
