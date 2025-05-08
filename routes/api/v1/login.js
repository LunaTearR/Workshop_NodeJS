var express = require("express");
var router = express.Router();
var userSchema = require("../../../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;

router.post("/", async function (req, res, next) {
  try {
    let { email, password } = req.body;

    const user = await userSchema.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ status: 404, message: "User not found. Please register." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: 401, message: "Incorrect password." });
    }

    const isStatusApproved = user.status;

    if (isStatusApproved !== "approve") {
      return res.status(403).json({
        status: 403,
        message: "User not approved. Please contact admin.",
      });
    }

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
        userId: user.id,
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      status: 200,
      message: "Login successful",
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        image: user.image,
        status: user.status,
        role: user.role,
      },
      token: token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error", error: error.message });
  }
});

module.exports = router;
