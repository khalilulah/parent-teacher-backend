const express = require("express");
const { verifyToken, verifyRole } = require("../utils/utilFunctions");
const {
  createOrganization,
} = require("../controllers/organizationControllers");
const upload = require("../utils/multerConfig");
const router = express.Router();

// Register a new organization
router.post(
  "/add",
  upload.single("file"),
  verifyRole(["superAdmin"]),
  createOrganization
);

module.exports = router;
