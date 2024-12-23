const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  role: { type: String, enum: ["parent", "teacher"], required: true },
  children: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Student" } // Only for parents
  ]
});

const User = mongoose.model("User", userSchema);

module.exports = User;
