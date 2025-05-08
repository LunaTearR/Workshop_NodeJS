var express = require("express");
var router = express.Router();
var productSchema = require("../../../models/product.model");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/users");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", async function (req, res, next) {
  try {
    let product = await productSchema.find({});

    return res
      .status(200)
      .json({ status: 200, message: "Success!", data: product });
  } catch (error) {
    res.send(error);
  }
});

router.post("/", upload.single("image"), async function (req, res, next) {
  try {
    const { name, description, price, category, stock } = req.body;

    let imagePath = null;
    if (req.file) {
      imagePath = req.file.filename;
    }

    const product = new productSchema({
      name,
      description,
      price,
      category,
      stock,
      image: imagePath,
    });

    await product.save()

    return res
      .status(200)
      .json({ status: 200, message: "Success!", data: product });
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
