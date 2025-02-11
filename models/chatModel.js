const { default: mongoose } = require("mongoose");

// Chat Schema
const chatSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      unique: true,
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ["group", "private"],
      default: "private",
    },
    name: {
      type: String,
      required: function () {
        return this.type === "group";
      },
    },
    latestMessage: {
      type: String,
    },
    unreadCount: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
