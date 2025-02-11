const mongoose = require("mongoose");

// Request Schema
const requestSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  guardian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Guardian",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  message: {
    type: String, // Optional message from the teacher
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;
