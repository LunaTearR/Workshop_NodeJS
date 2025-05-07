const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    image: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String,enum: ["approve", "pending"], default: "pending"}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("users", userSchema);
