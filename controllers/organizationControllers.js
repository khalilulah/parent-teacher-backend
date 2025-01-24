const Organization = require("../models/organizationModel");
const { sendResponse } = require("../utils/utilFunctions");

// Function to create a new organization
const createOrganization = async (req, res) => {
  try {
    // Get user data from token
    const { userData } = req.userData;

    // Validate request (Additional validation just in case)
    if (!userData) {
      return sendResponse(res, 401, "Please login to continue", null);
    }

    const { name, street, city, state, country, postalCode } = req?.body;

    // Validate required fields
    if (!name) {
      return sendResponse(
        res,
        400,
        "Please provide all required parameters",
        null
      );
    }

    // Details of the new organization
    const newOrgDetails = {
      name,
      address: { city },
      createdBy: userData?._id,
    };

    // Save new org. details to the DB
    const newOrganization = await new Organization(newOrgDetails).save();

    if (newOrganization) {
      // Prepare response data by removing sensitive information from user object
      const { _id, __v, ...rest } = newOrganization._doc;

      return sendResponse(res, 201, "Organization successfully created.", {
        ...rest,
      });
    } else {
      return sendResponse(
        res,
        400,
        "Error occurred while creating a new organization.",
        null
      );
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
// End of function to create a new organization

module.exports = { createOrganization };
