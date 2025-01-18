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
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
