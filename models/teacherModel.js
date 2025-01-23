const { default: mongoose } = require("mongoose");
const User = require("./userModel");

// Teacher Schema
const teacherSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  classLevel: String,
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  guardians: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guardian",
    },
  ],
});

const Teacher = User.discriminator("teacher", teacherSchema);

module.exports = { Teacher };
