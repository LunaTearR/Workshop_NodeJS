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

    const imagePath = req.file ? req.file.filename : null;

    const product = new productSchema({
      name,
      description,
      price,
      category,
      stock,
      image: imagePath,
    });

    await product.save();

    return res
      .status(200)
      .json({ status: 200, message: "Success!", data: product });
  } catch (error) {
    res
      .status(400)
      .json({ status: 400, message: "Add product failed!", error });
  }
});

router.put("/:id", upload.single("image"), async function (req, res, next) {
  try {
    let { id } = req.params;
    const { name, description, price, category, stock } = req.body;

    const existingProduct = await productSchema.findById(id);
    if (!existingProduct) {
      return res
        .status(404)
        .json({ status: 404, message: "Product not found!" });
    }

    let product = await productSchema.findByIdAndUpdate(
      id,
      {
        name: name ?? existingProduct.name,
        description: description ?? existingProduct.description,
        price: price ?? existingProduct.price,
        category: category ?? existingProduct.category,
        stock: stock ?? existingProduct.stock,
        image: req.file ? req.file.filename : existingProduct.image,
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ status: 200, message: "Edit product success!", data: product });
  } catch (error) {
    res
      .status(400)
      .json({ status: 400, message: "Edit product failed!", error });
  }
});

module.exports = router;
