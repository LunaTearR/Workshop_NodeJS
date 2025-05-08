const jwt = require("jsonwebtoken");
const userSchema = require("../models/user.model");
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;

module.exports = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).send("Token is required.");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }

    const decoded = jwt.verify(token, SECRET_KEY);

    const user = await userSchema.findById(decoded.userId);

    if (!user) {
      return res.status(404).send("User not found.");
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(500).json({ status: 500, message:"Token validation failed: " + error.message});
  }
};
