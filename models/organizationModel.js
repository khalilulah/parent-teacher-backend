const mongoose = require("mongoose");

// Organization (School) Schema
const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    admins: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
    teachers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
    guardians: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References superAdmin
      required: true,
    },
  },
  { timestamps: true }
);

const Organization = mongoose.model("Organization", organizationSchema);

module.exports = Organization;
