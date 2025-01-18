const express = require("express");
const { verifyToken, verifySuperAdmin } = require("../utils/utilFunctions");
const {
  createOrganization,
} = require("../controllers/organizationControllers");
const router = express.Router();

// Reguster super admin
router.post("/add", verifySuperAdmin, createOrganization);

module.exports = router;
