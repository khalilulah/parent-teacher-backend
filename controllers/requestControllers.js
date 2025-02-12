const { Guardian } = require("../models/guardianModel");
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

// Function for guardian to accepts a request
const acceptRequest = async (req, res) => {
  try {
    // Get user data from token
    const { userData } = req.userData;

    // Validate request (Additional validation just in case)
    if (!userData) {
      return sendResponse(res, 401, "Please login to continue");
    }

    const guardianId = userData?._id;

    const { requestId } = req.body;

    // Find the request
    const request = await Request.findById(requestId);
    if (!request) {
      return sendResponse(res, 404, "Request not found");
    }

    // Ensure the guardian is the correct recipient
    if (request.guardian.toString() !== guardianId) {
      return sendResponse(res, 403, "Unauthorized action");
    }

    // Update request status
    request.status = "accepted";
    await request.save();

    // Add teacher to the guardian's teachers list
    await Guardian.findByIdAndUpdate(guardianId, {
      $addToSet: { teachers: request.teacher },
    });

    sendResponse(res, 200, "Request accepted successfully", request);
  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

// Guardian rejects a request
const rejectRequest = async (req, res) => {
  try {
    // Get user data from token
    const { userData } = req.userData;

    // Validate request (Additional validation just in case)
    if (!userData) {
      return sendResponse(res, 401, "Please login to continue");
    }

    const guardianId = userData?._id;

    const { requestId } = req.body;

    // Find the request
    const request = await Request.findById(requestId);
    if (!request) {
      return sendResponse(res, 404, "Request not found");
    }

    // Ensure the guardian is the correct recipient
    if (request.guardian.toString() !== guardianId) {
      return sendResponse(res, 403, "Unauthorized action");
    }

    // Update request status
    request.status = "rejected";
    await request.save();

    sendResponse(res, 200, "Request rejected successfully", request);
  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

module.exports = { getRequests, acceptRequest, rejectRequest };
