const express = require("express");
const { verifyToken, verifyRole } = require("../utils/utilFunctions");
const {
  createOrganization,
} = require("../controllers/organizationControllers");
const router = express.Router();

// Register a new organization
router.post("/add", verifyRole(["superAdmin"]), createOrganization);

module.exports = router;
