const express = require("express");
const {
  register,
  addOrganizationAdmin,
} = require("../controllers/authControllers");
const { verifyRole } = require("../utils/utilFunctions");
const {
  rejectRequest,
  getRequests,
  acceptRequest,
} = require("../controllers/requestControllers");
const router = express.Router();

// Route to get requests
router.get("/", verifyRole(["guardian"]), getRequests);

// Route to acept a request
router.post("/acceptRequest", verifyRole(["guardian"]), acceptRequest);

// Route to reject request
router.post("/rejectRequest", verifyRole(["guardian"]), rejectRequest);

module.exports = router;
