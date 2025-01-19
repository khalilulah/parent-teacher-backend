const User = require("../models/userModel");
const {
  sendResponse,
  sendEmailVerification,
  generateStrongPassword,
  sendTemporaryLoginCredentials,
} = require("../utils/utilFunctions");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
    const { firstname, surname, email } = req.body;

    // Validate required fields
    if (!firstname || !surname || !email) {
      return sendResponse(res, 400, "Please provide all required parameters");
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
        role: "organizationAdmin",
        addedBy: userData?._id,
      };

      // Send temporary login credentials
      await sendTemporaryLoginCredentials(email, firstname, surname, password);

      // Create new user
      const savedUser = await User.create(userDetails);

      if (savedUser) {
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
      {
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
            _id,
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

module.exports = {
  register,
  login,
  addOrganizationAdmin,
  changePassword,
  sendCode,
  updatePasswordByCode,
};
