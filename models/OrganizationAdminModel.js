const { default: mongoose } = require("mongoose");
const User = require("./userModel");

// Organization Admin Schema
const organizationAdminSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
});

const OrganizationAdmin = User.discriminator(
  "organizationAdmin",
  organizationAdminSchema
);

module.exports = { OrganizationAdmin };
