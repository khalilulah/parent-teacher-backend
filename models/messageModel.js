const mongoose = require("mongoose");

// Message Schema
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    chatId: {
      type: String,
      ref: "Chat", // Reference to the Chat model
      required: true,
    },
    message: {
      type: String,
    },
    fileUrl: { type: String }, // Store Firebase file URL
    fileType: { type: String }, // e.g., "image/png"
    fileName: { type: String },
    fileSize: { type: Number },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["not delivered", "delivered", "read"],
      default: "not delivered",
    }, // Store delivery status
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
