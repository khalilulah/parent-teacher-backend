const { OrganizationAdmin } = require("../models/OrganizationAdminModel");
const Chat = require("../models/chatModel");
const { Guardian } = require("../models/guardianModel");
const Organization = require("../models/organizationModel");
const { Teacher } = require("../models/teacherModel");
const User = require("../models/userModel");
const { v4: uuidv4 } = require("uuid"); // For generating unique chat IDs
const {
  sendResponse,
  sendEmailVerification,
  generateStrongPassword,
  sendTemporaryLoginCredentials,
  generateUsername,
} = require("../utils/utilFunctions");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Request = require("../models/requestModel");
const { io } = require("..");

/**
 * Validate the password input.
 */
const validatePassword = (password, verifyPassword) => {
  return password === verifyPassword && password.length >= 4;
};

// Function to generate JWT token with expiry time
const generateToken = (userData, expiryTime) => {
  // Generating a JWT token using the provided user data and expiry time
  return jwt.sign({ userData }, process.env.JWT_SECRET, {
    expiresIn: expiryTime,
  });
};

const generateVerificationCode = async () => {
  // Generate random six-digit code
  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  return verificationCode;

  // Calculate verification code expiry time (2 minutes from now)
  // const expiryDate = new Date(Date.now() + 2 * 60 * 1000);
};

/**
 * Register a new user (super admin) and send the appropriate verification.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with registration status and data
 */
const register = async (req, res) => {
  try {
    // Get user data from token
    const { userData } = req.userData;

    // Validate request (Additional validation just in case)
    if (!userData) {
      return sendResponse(res, 401, "Please login to continue", null);
    }

    // Extract necessary details
    const { firstname, surname, password, verifyPassword, email } = req.body;

    // Validate required fields
    if (!password || !verifyPassword || !firstname || !surname || !email) {
      return sendResponse(
        res,
        400,
        "Please provide all required parameters",
        null
      );
    }

    // Trim input strings and validate passwords
    const trimmedPassword = password.trim();
    const trimmedVerifyPassword = verifyPassword.trim();

    if (!validatePassword(trimmedPassword, trimmedVerifyPassword)) {
      return sendResponse(
        res,
        400,
        "Passwords do not match or are too short",
        null
      );
    }

    // Check if a user exists with the same email
    let existingUser = await User.findOne({ email });

    // Generate a new verification code and expiry date
    const verificationCode = await generateVerificationCode();
    const expiryDate = new Date(Date.now() + 2 * 60 * 1000);

    if (existingUser) {
      // If user exists and is not active, update their verification details
      if (existingUser.status === "inactive") {
        existingUser.verification.code = verificationCode;
        existingUser.verification.expiryDate = expiryDate;
        await existingUser.save();

        // Send verification code again
        await sendEmailVerification(res, email, verificationCode);
        return sendResponse(res, 200, "Verification code sent");
      } else {
        // If user exists and is active, return an error message
        return sendResponse(res, 403, "User already exists", null);
      }
    } else {
      // Create a new user if no existing user is found
      const userDetails = {
        email,
        password: trimmedPassword,
        verification: {
          code: verificationCode,
          expiryDate: expiryDate,
        },
        firstname,
        surname,
        role: "superAdmin",
      };

      // Create new user
      const savedUser = await User.create(userDetails);

      if (savedUser) {
        // Send verification code again
        await sendEmailVerification(res, email, verificationCode);

        return sendResponse(res, 201, "Verification code sent");
      }

      return sendResponse(res, 400, "Error occurred while creating user", null);
    }
  } catch (error) {
    console.error("Registration Error:", error);
    return sendResponse(
      res,
      500,
      error?.message || error || "Internal Server Error",
      null
    );
  }
};

/**
 * Register a new user (organization admin) and send the appropriate verification.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with registration status and data
 */
const addOrganizationAdmin = async (req, res) => {
  try {
    // Get user data from token
    const { userData } = req.userData;

    // Validate request (Additional validation just in case)
    if (!userData) {
      return sendResponse(res, 401, "Please login to continue", null);
    }

    // Extract necessary details
    const { firstname, surname, email, organizationId } = req.body;

    // Validate required fields
    if (!firstname || !surname || !email || !organizationId) {
      return sendResponse(res, 400, "Please provide all required parameters");
    }

    // Check if the organization is valid
    let existingOrganization = await Organization.findById(organizationId);

    if (!existingOrganization?.name) {
      return sendResponse(res, 400, "Invalid Organization ID");
    }

    // Check if a user exists with the same email
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      return sendResponse(res, 403, "User already exists", null);
    } else {
      // Generate password
      const password = generateStrongPassword(); // Default 12 characters

      // Create a new user if no existing user is found
      const userDetails = {
        email,
        password,
        firstname,
        surname,
        organization: organizationId,
        addedBy: userData?._id,
      };

      // Send temporary login credentials
      await sendTemporaryLoginCredentials(email, firstname, surname, password);

      // Create new user
      const savedUser = await OrganizationAdmin.create(userDetails);

      if (savedUser) {
        // Add user (organization admin) to the organization
        existingOrganization.admins.push(savedUser?._id);
        await existingOrganization.save();

        return sendResponse(res, 201, "Temporary login credentials sent");
      }

      return sendResponse(res, 400, "Error occurred while creating user", null);
    }
  } catch (error) {
    console.error("Registration Error:", error);
    return sendResponse(
      res,
      500,
      error?.message || error || "Internal Server Error",
      null
    );
  }
};

/**
 * Register a new user (teacher) and send the appropriate verification.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with registration status and data
 */
const addTeacher = async (req, res) => {
  try {
    // Get user data from token
    const { userData } = req.userData;

    const organizationId = userData?.organization;

    // Validate request (Additional validation just in case)
    if (!userData) {
      return sendResponse(res, 401, "Please login to continue");
    }

    // Extract necessary details
    const { firstname, surname, email, classLevel, guardians } = req.body;

    // Validate required fields
    if (!firstname || !surname || !email) {
      return sendResponse(res, 400, "Please provide all required parameters");
    }

    // Check if the organization is valid
    let existingOrganization = await Organization.findById(organizationId);

    if (!existingOrganization?.name) {
      return sendResponse(res, 400, "Invalid Organization ID");
    }

    // Verify if the user exists and is active
    const query = {
      email,
      status: "active",
    };

    // Check if a user exists with the same email
    let existingUser = await User.findOne(query);

    if (existingUser) {
      return sendResponse(res, 403, "User already exists", null);
    } else {
      // Generate password
      const password = generateStrongPassword(); // Default 12 characters

      // Create a new user if no existing user is found
      const userDetails = {
        email,
        password,
        firstname,
        surname,
        organization: organizationId,
        addedBy: userData?._id,
        classLevel,
        guardians,
      };

      // Send temporary login credentials
      await sendTemporaryLoginCredentials(email, firstname, surname, password);

      // Create new user
      const savedUser = await Teacher.create(userDetails);

      if (savedUser) {
        // Add user (teacher) to the organization
        existingOrganization.teachers.push(savedUser?._id);
        await existingOrganization.save();

        return sendResponse(res, 201, "Temporary login credentials sent");
      }

      return sendResponse(res, 400, "Error occurred while creating user", null);
    }
  } catch (error) {
    console.error("Registration Error:", error);
    return sendResponse(
      res,
      500,
      error?.message || error || "Internal Server Error",
      null
    );
  }
};

/**
 * Register a new user (guardian) and send the appropriate verification.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with registration status and data
 */
const addGuardian = async (req, res) => {
  try {
    // Get user data from token
    const { userData } = req.userData;

    // Check if the teacher is valid
    let existingTeacher = await Teacher.findById(userData?._id);

    if (!existingTeacher) {
      return sendResponse(res, 400, "Invalid Organization ID");
    }

    // Extract necessary details
    const { firstname, surname, email, title } = req.body;

    // Validate required fields
    if (!firstname || !surname || !email || !title) {
      return sendResponse(res, 400, "Please provide all required parameters");
    }

    // Verify if the user exists and is active
    const query = {
      email,
    };

    // Check if a user exists with the same email
    let existingUser = await User.findOne(query);

    if (existingUser && existingUser.status === "active") {
      return sendResponse(res, 403, "User already exists", null);
    }

    if (existingUser && existingUser.status === "inactive") {
      // Generate password
      const password = generateStrongPassword(); // Default 12 characters

      // Generate username
      const uniqueUsername = generateUsername(firstname, surname);

      // Send temporary login credentials
      await sendTemporaryLoginCredentials(email, firstname, surname, password);

      return sendResponse(res, 201, "Temporary login credentials re-sent");
    } else {
      // Generate password
      const password = generateStrongPassword(); // Default 12 characters

      // Generate username
      const uniqueUsername = generateUsername(firstname, surname);
      // Create a new user if no existing user is found
      const userDetails = {
        email,
        password,
        firstname,
        title,
        surname,
        uniqueUsername,
        addedBy: userData?._id,
        teachers: [userData?._id],
      };

      // Send temporary login credentials
      await sendTemporaryLoginCredentials(email, firstname, surname, password);

      // Create new user
      const savedUser = await Guardian.create(userDetails);

      if (savedUser) {
        // Add user (guardian) to the teacher's guardians list
        existingTeacher.guardians.push(savedUser?._id);
        await existingTeacher.save();

        // Create Chat between users
        const participantIds = [savedUser?._id, existingTeacher?._id];
        const sortedIds = participantIds.sort();

        // Check if a chat with these participants exists
        let chat = await Chat.findOne({ participants: sortedIds });

        if (!chat) {
          // If not, create a new chat
          const chatId = uuidv4();
          chat = new Chat({
            chatId,
            participants: sortedIds,
          });
          await chat.save();
        }
        return sendResponse(res, 201, "Temporary login credentials sent");
      }

      return sendResponse(res, 400, "Error occurred while creating user", null);
    }
  } catch (error) {
    console.error("Registration Error:", error);
    return sendResponse(
      res,
      500,
      error?.message || error || "Internal Server Error",
      null
    );
  }
};

/**
 * Login with email
 * Checks if the user exists, verify their password, and proceed based on the password verification response.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
const login = async (req, res) => {
  try {
    // Extracting request body parameter using destructuring
    const { email, password } = req.body;

    // Validate input parameters
    if (!email || !password) {
      // Sending a 400 response if any required parameter is missing
      return sendResponse(
        res,
        400,
        "Please provide all required parameters",
        null
      );
    }

    // Trim input strings to remove leading and trailing whitespace
    const trimmedContact = email.trim();

    // Check if a user exists with the same contact (regardless of status)
    let existingUser = await User.findOne({ email: trimmedContact });

    // If the user exists
    if (existingUser) {
      if (existingUser?.isDefaultPassword) {
        return sendResponse(res, 200, "Welcome! Please create a new password", {
          action: "changeDefaultPassword",
        });
      } else {
        console.log("Not def");
        // If user exists and is active, compare their passwords
        // Verify password
        const passwordMatch = await bcrypt.compare(
          password,
          existingUser.password
        );

        // if the passwords don't match
        if (!passwordMatch) {
          return sendResponse(res, 401, "Incorrect login credentials", null);
        } else {
          // If the paswwords match

          // Create and assign a JWT
          // Generate JWT token for the user
          const token = generateToken(existingUser, "100y"); // Generating a token with 1-hour expiry

          //   UPDATE THE LASTLOGIN FIELD
          existingUser.lastLogin = new Date();
          await existingUser.save();

          // Prepare response data by removing sensitive information from user object
          const {
            password: userPassword,
            verification,
            __v,
            ...userData
          } = existingUser._doc;

          // Sending a 200 response with the token and user data
          return sendResponse(res, 200, "Login successful", {
            token,
            ...userData,
          });
        }
      }
    } else {
      // If the user doesn't exist in the DB, return this error
      return sendResponse(
        res,
        401,
        "User not found. Kindly register to proceed",
        null
      );
    }
  } catch (error) {
    // Handling any server errors and sending a 500 response
    console.error("Error:", error);
    return sendResponse(
      res,
      500,
      error?.message || error || "Internal Server Error",
      null
    );
  }
};

/**
 * Change password.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with registration status and data
 */
const changePassword = async (req, res) => {
  try {
    // Get user data from token
    const { userData } = req.userData;

    // Validate request (Additional validation just in case)
    if (!userData) {
      return sendResponse(res, 401, "Please login to continue");
    }

    // Extract necessary details
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // Validate required fields
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return sendResponse(
        res,
        400,
        "Please provide all required parameters",
        null
      );
    }

    // Check if a user exists with the same email
    let existingUser = await User.findOne({ email: userData.email });

    if (!existingUser) {
      return sendResponse(res, 400, "User not found", null);
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(
      oldPassword,
      existingUser.password
    );

    // if the passwords don't match
    if (!passwordMatch) {
      return sendResponse(res, 401, "Incorrect password!", null);
    }

    // Check if the new passwords match
    if (!validatePassword(newPassword, confirmNewPassword)) {
      return sendResponse(
        res,
        400,
        "Passwords do not match or are too short",
        null
      );
    }

    // Update password
    existingUser.password = newPassword;
    existingUser.isDefaultPassword = false;
    existingUser.status = "active";

    // Save changes
    await existingUser.save();

    return sendResponse(res, 200, "Password update successful");
  } catch (error) {
    console.error("Could not update password:", error);
    return sendResponse(
      res,
      500,
      error?.message || error || "Internal Server Error",
      null
    );
  }
};

/**
 * Resend verification code to the user's email.
 * Checks if the user exists and then sends a new verification code.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
const sendCode = async (req, res) => {
  try {
    // Extracting request body parameter using destructuring
    const { email } = req.body;

    // Validate input parameters
    if (!email) {
      // Sending a 400 response if any required parameter is missing
      return sendResponse(
        res,
        400,
        "Please provide all required parameters",
        null
      );
    }

    // Check if a user exists with the same email
    let existingUser = await User.findOne({ email });

    // Generate a new verification code and expiry date
    const verificationCode = await generateVerificationCode();
    const expiryDate = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 mins

    // If the user exists
    if (existingUser) {
      existingUser.verification.code = verificationCode;
      existingUser.verification.expiryDate = expiryDate;
      await existingUser.save();

      // Send verification code again
      await sendEmailVerification(res, email, verificationCode);
      return sendResponse(res, 200, "Verification code sent");
    } else {
      // If the user doesn't exist in the DB, return this error
      return sendResponse(res, 401, "Kindly register to proceed");
    }
  } catch (error) {
    // Handling any server errors and sending a 500 response
    console.error("Error:", error);
    return sendResponse(
      res,
      500,
      error?.message || error || "Internal Server Error",
      null
    );
  }
};

/**
 * Update user's password by matching the submitted verification code with the stored code
 * and checking if it's not expired.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
const updatePasswordByCode = async (req, res) => {
  try {
    const { email, newPassword, confirmNewPassword, verificationCode } =
      req.body;

    // Validate input parameters
    if (!email || !newPassword || !confirmNewPassword || !verificationCode) {
      return sendResponse(
        res,
        400,
        "Please provide all required parameters",
        null
      );
    }

    // Construct a search query to find the user based on contact and verification code
    const query = {
      email,
      "verification.code": verificationCode,
    };

    // Find the user with the given contact and verification code
    const user = await User.findOne(query);

    // If no user is found or verification code is incorrect, return an error message
    if (!user) {
      return sendResponse(
        res,
        403,
        "Invalid user details or verification code",
        null
      );
    }

    // Check if the verification code is expired
    if (new Date() > user.verification.expiryDate) {
      return sendResponse(
        res,
        403,
        "The activation code has expired. Kindly resend code.",
        null
      );
    }

    // Check if the new passwords match
    if (!validatePassword(newPassword, confirmNewPassword)) {
      return sendResponse(
        res,
        400,
        "Passwords do not match or are too short",
        null
      );
    }

    // Update password
    user.password = newPassword;
    user.isDefaultPassword = false;
    user.status = "active";

    // Save changes
    await user.save();

    return sendResponse(res, 200, "Password update successful");
  } catch (error) {
    console.error("Could not update password:", error);
    return sendResponse(
      res,
      500,
      error?.message || "Internal Server Error",
      null
    );
  }
};

// FUNCTION FOR a teacher to send a request to a guardian
const sendRequest = async (req, res, io) => {
  try {
    // Get user data from token
    const { userData } = req.userData;

    // Validate request (Additional validation just in case)
    if (!userData) {
      return sendResponse(res, 401, "Please login to continue");
    }

    const { guardianUsername, message } = req.body;

    // Validate required parameters
    if (!guardianUsername) {
      return sendResponse(
        res,
        400,
        "Please provide all required parameters",
        null
      );
    }

    // Check if the guardian exists
    const guardian = await Guardian.findOne({
      uniqueUsername: guardianUsername,
    });

    if (!guardian) {
      return sendResponse(res, 404, "Guardian not found");
    }

    // Check if request already exists
    const existingRequest = await Request.findOne({
      teacher: userData?._id,
      guardian: guardian?._id,
      status: "pending",
    });

    if (existingRequest) {
      return sendResponse(res, 400, "Request already sent");
    }

    // Create new request
    const newRequest = new Request({
      teacher: userData?._id,
      guardian: guardian?._id,
      message,
    });

    await newRequest.save();
    // Emit event to notify guardians
    io.emit("new_request");

    return sendResponse(res, 201, "Request sent successfully", newRequest);
  } catch (error) {
    console.error("Could not update password:", error);
    return sendResponse(
      res,
      500,
      error?.message || "Internal Server Error",
      null
    );
  }
};
// End of FUNCTION FOR a teacher to send a request to a guardian

module.exports = {
  register,
  sendRequest,
  login,
  addOrganizationAdmin,
  changePassword,
  sendCode,
  updatePasswordByCode,
  addTeacher,
  addGuardian,
};
