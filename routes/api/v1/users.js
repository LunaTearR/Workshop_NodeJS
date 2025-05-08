var express = require("express");
var router = express.Router();
var userSchema = require("../../../models/user.model");
const tokenMiddleware = require("../../../middleware/token.middleware");

router.get("/", tokenMiddleware, async function (req, res, next) {
  try {
    let users = await userSchema.find({});

    return res
      .status(200)
      .json({ status: 200, message: "Success!", data: users });
  } catch (error) {
    res.send(error);
  }
});

router.put("/:id/approve", tokenMiddleware, async function (req, res, next) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: 403,
        message: "Only admins can approve users.",
      });
    }

    let { id } = req.params;
    let status = "approve";

    let user = await userSchema.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    return res
      .status(201)
      .json({ status: 201, message: "Approved!", data: user });
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "User approve fail! ", error });
  }
});

module.exports = router;
