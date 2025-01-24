const User = require("./userModel");

// Guardian Schema
const guardianSchema = new mongoose.Schema(
  {
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
    requests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
      },
    ],
  },
  { timestamps: true }
);

const Guardian = User.discriminator("Guardian", guardianSchema);

module.exports = { Guardian };
