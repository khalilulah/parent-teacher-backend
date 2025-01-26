const User = require("../models/userModel");
const { otpTemplate, temporaryCredentialsTemplate } = require("./emailSamples");
const sendMail = require("./sendMail");
const jwt = require("jsonwebtoken");

/**
 * Sends a verification code email to the specified email address.
 *
 * @param {string} email - The email address to send the verification code to.
 * @param {string} verificationCode - The verification code to be included in the email.
 * @returns {Promise<void>} A Promise representing the completion of the email sending process.
 */
const sendEmailVerification = async (res, trimmedEmail, verificationCode) => {
  try {
    // HTML message for email verification
    const htmlMessage = otpTemplate(verificationCode);

    // Send verification code to user's email
    await sendMail({
      email: trimmedEmail,
      subject: "Verification code",
      html: htmlMessage,
    });
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Sends temporary login credentials to the specified email address.
 *
 * @param {string} trimmedEmail - The email address to send the verification code to.
 * @returns {Promise<void>} A Promise representing the completion of the email sending process.
 */
const sendTemporaryLoginCredentials = async (
  trimmedEmail,
  firstname,
  surname,
  password
) => {
  try {
    // HTML message for email verification
    const htmlMessage = temporaryCredentialsTemplate(
      trimmedEmail,
      password,
      firstname,
      surname
    );

    // Send verification code to user's email
    await sendMail({
      email: trimmedEmail,
      subject: "Account Manager",
      html: htmlMessage,
    });
  } catch (error) {
    throw new Error(error);
  }
};

const sendResponse = (res, statusCode, message, data) => {
  return res.status(statusCode).json({
    message,
    data,
    status: statusCode === 200 || statusCode === 201 ? "SUCCESS" : "FAILED",
  });
};

/**
 * Middleware to verify the authenticity of JWT token in the request header.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
const verifyToken = (req, res, next) => {
  try {
    // Extract authHeader from the request header
    const authHeader = req.headers.authorization;

    // If authHeader is not provided, send 401 Unauthorized response
    if (!authHeader) {
      return sendResponse(
        res,
        401,
        "You're not authenticated, please login",
        null
      );
    }

    // Check if token starts with "Bearer"
    if (!authHeader.startsWith("Bearer ")) {
      return sendResponse(res, 401, "Invalid token format", null);
    }

    // Extract the token part after "Bearer "
    const token = authHeader.split(" ")[1];

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, userData) => {
      if (err) {
        // If token is invalid, send 403 Forbidden response
        return sendResponse(
          res,
          403,
          "Invalid or expired token, please login",
          null
        );
      }

      // Attach decoded user data to request object for further use
      req.userData = userData;
      next();
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Error verifying token:", error);
    // Send 500 Internal Server Error response
    return sendResponse(res, 500, "Internal Server Error", null);
  }
};

// Function to verify the role of the user calling the endpoint
const verifyRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      verifyToken(req, res, async () => {
        const decodedToken = req.userData?.userData;
        const user = await User.findById(decodedToken._id);

        if (!user) {
          return sendResponse(res, 401, "User not found");
        }

        if (!allowedRoles.includes(user.role)) {
          return sendResponse(
            res,
            401,
            "You do not have permission to access this resource"
          );
        }
        next();
      });
    } catch (error) {
      return sendResponse(
        res,
        403,
        "Invalid or expired token, please login",
        null
      );
    }
  };
};
// End of function to verify the role of the user calling the endpoint

// Function to generate password
function generateStrongPassword(length = 12) {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const allChars = uppercase + lowercase + numbers + special;
  let password = "";

  // Ensure at least one of each character type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
// End of function to generate password

// Function to generate username
function generateUsername(firstname, surname) {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `${firstname
    .toLowerCase()
    .replace(/\s+/g, "")}_${randomSuffix}_${surname
    .toLowerCase()
    .replace(/\s+/g, "")}`;
}
// End of function to generate username

module.exports = {
  sendResponse,
  sendEmailVerification,
  verifyToken,
  verifyRole,
  generateStrongPassword,
  sendTemporaryLoginCredentials,
  generateUsername,
};
