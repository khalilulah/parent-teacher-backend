const { initializeApp } = require("firebase/app");
const Organization = require("../models/organizationModel");
const { sendResponse } = require("../utils/utilFunctions");
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: "store-manager-8657f.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

// Function to handle file upload
const getFile = async (req) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Create a reference in Firebase Storage
    const fileName = `${Date.now()}-${file.originalname}`;
    const storageRef = ref(storage, `organization_files/${fileName}`);

    // Upload the file from memory buffer
    const metadata = {
      contentType: file.mimetype,
    };

    const snapshot = await uploadBytes(storageRef, file.buffer, metadata);

    // Get the public URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (err) {
    console.error("File upload error:", err);
    return err;
  }
};

// Function to create a new organization
const createOrganization = async (req, res) => {
  try {
    // 1. Upload file to get url
    const fileDetails = await getFile(req);
    console.log(fileDetails);

    // Proceed with Organisation registration if file upload is successful
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
