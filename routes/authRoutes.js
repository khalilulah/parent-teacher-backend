const express = require("express");
const { registerUser } = require("../controllers/userController");
const {
  register,
  login,
  addOrganizationAdmin,
  updatePasswordByCode,
  sendCode,
  changePassword,
  addTeacher,
  addGuardian,
  sendRequest,
  getTeacherOrgs,
} = require("../controllers/authControllers");
const { verifyRole, verifyToken } = require("../utils/utilFunctions");

module.exports = (io) => {
  const router = express.Router();

  // Route to add a super admin
  router.post("/register/super", verifyRole(["superAdmin"]), register); // Route to add a super admin

  // Route to add an organisation admin
  router.post(
    "/register/organizationAdmin",
    verifyRole(["superAdmin"]),
    addOrganizationAdmin
  );

  // Route to add a teacher
  router.post(
    "/register/teacher",
    verifyRole(["organizationAdmin"]),
    addTeacher
  );

  // Route to add a guardian
  router.post("/register/guardian", verifyRole(["teacher"]), addGuardian);

  // Route to send request to a guardian
  router.post("/guardian/sendRequest", verifyRole(["teacher"]), (req, res) =>
    sendRequest(req, res, io)
  );

  // Login Route
  router.post("/login", login);

  // Default password change  Route
  router.post("/changeDefaultPassword", verifyToken, changePassword);

  // Reset password Route
  router.post("/resetPassword", updatePasswordByCode);

  // Resend OTP Route
  router.post("/sendOtp", sendCode);

  // Get teachers orgs
  router.get("/getTeacherOrgs", verifyRole(["guardian"]), getTeacherOrgs);

  return router;
};
