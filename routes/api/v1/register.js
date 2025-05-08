var express = require("express");
var router = express.Router();
var userSchema = require("../../../models/user.model");
const multer = require("multer");
const bcrypt = require("bcrypt");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/users");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role, status } =
      req.body;

    const checkuser = await userSchema.findOne({ email });

    if (checkuser) {
      return res.status(400).json({
        status: 400,
        message: "email is already exit. Please login.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const imagePath = req.file ? req.file.filename : null;

    const user = new userSchema({
      firstName,
      lastName,
      email,
      phone,
      role,
      status,
      password: hashedPassword,
      image: imagePath,
    });

    await user.save();

    const { password: _, ...safeUser } = user.toObject();

    res.status(201).json({
      status: 201,
      message: "User registered successfully",
      data: safeUser,
    });
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
