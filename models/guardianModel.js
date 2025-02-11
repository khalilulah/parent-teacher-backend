const { default: mongoose } = require("mongoose");
const User = require("./userModel");

// Guardian Schema
const guardianSchema = new mongoose.Schema({
  uniqueUsername: {
    type: String,
    required: true,
    unique: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  teachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
  ],
});

const Guardian = User.discriminator("guardian", guardianSchema);

module.exports = { Guardian };
