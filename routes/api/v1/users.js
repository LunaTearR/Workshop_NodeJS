var express = require("express");
var router = express.Router();
var userSchema = require("../../../models/user.model");

router.get("/", async function (req, res, next) {
  try {
    let users = await userSchema.find({});

    return res
      .status(200)
      .json({ status: 200, message: "Success!", data: users });
  } catch (error) {
    res.send(error);
  }
});

router.put("/:id/approve", async function (req, res, next) {
  try {
    let { id } = req.params;
    let status = "approve";
    console.log(status);
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
