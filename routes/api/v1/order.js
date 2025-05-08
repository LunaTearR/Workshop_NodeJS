var express = require("express");
var router = express.Router();
var orderSchema = require("../../../models/order.model");
const tokenMiddleware = require("../../../middleware/token.middleware");

router.get("/", tokenMiddleware, async function (req, res, next) {
  try {
    let order = await orderSchema
      .find({})
      .populate("user", "firstName lastName email")
      .populate("items.product", "name description price category stock image")
      .sort({ createdAt: -1 })
      .exec();

    return res
      .status(200)
      .json({ status: 200, message: "Success!", data: order });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Fetch orders failed!",
      error: error.message,
    });
  }
});

module.exports = router;
