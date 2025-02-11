const Request = require("../models/requestModel");
const { sendResponse } = require("../utils/utilFunctions");

// Function to get all requests
const getRequests = async (req, res) => {
  try {
    // Get user data from token
    const { userData } = req.userData;

    // Validate request (Additional validation just in case)
    if (!userData) {
      return sendResponse(res, 401, "Please login to continue");
    }

    const { guardianId, status } = req.query;

    // Validate required parameters
    if (!guardianId) {
      return sendResponse(
        res,
        400,
        "Please provide all required parameters",
        null
      );
    }

    const searchQuery = { guardian: guardianId, status };

    // Query DB for specific requests
    const requests = await Request.find(searchQuery)
      .populate({
        path: "teacher",
        model: "User", // Since Teacher is a discriminator of User
      })
      .sort({ timestamp: 1 });
    return sendResponse(res, 200, "Requests successfully fetched", requests);
  } catch (error) {
    console.error("Could not fetch requests", error);
    return sendResponse(
      res,
      500,
      error?.message || "Internal Server Error",
      null
    );
  }
};
// End of Function to get all requests

module.exports = { getRequests };
