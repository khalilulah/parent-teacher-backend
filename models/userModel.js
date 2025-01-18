const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// User Schema - Base schema for all user types
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["superAdmin", "organizationAdmin", "teacher", "guardian"],
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    phoneNumber: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    verification: {
      code: { type: Number },
      expiryDate: { type: Date },
      createdAt: {
        type: Date,
        default: Date.now(),
      },
    },
    status: {
      type: String,
      enum: ["inactive", "active", "suspended", "deactivated"],
      default: "inactive",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References superAdmin
    },
    lastLogin: Date,
  },
  { discriminatorKey: "role" },
  { timestamps: true }
);

// HASH PASSWORD BEFORE STORING IN THE DB
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      next();
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);

      return (this.password = hashedPassword);
    }
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
});
// END OF  HASH PASSWORD BEFORE STORING IN THE DB

const User = mongoose.model("User", userSchema);

module.exports = User;
