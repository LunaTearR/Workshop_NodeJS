var express = require("express");
var router = express.Router();
var productSchema = require("../../../models/product.model");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/products");
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
    return res.status(500).json({
      status: 500,
      message: "Fetch products failed!",
      error: error.message,
    });
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    let { id } = req.params;
    let product = await productSchema.findById(id);

    return res
      .status(200)
      .json({ status: 200, message: "Success!", data: product });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Fetch products failed!",
      error: error.message,
    });
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
    return res.status(400).json({
      status: 400,
      message: "Add products failed!",
      error: error.message,
    });
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
    return res.status(400).json({
      status: 400,
      message: "Edit products failed!",
      error: error.message,
    });
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    let { id } = req.params;

    const existingProduct = await productSchema.findById(id);

    if (!existingProduct) {
      return res
        .status(404)
        .json({ status: 404, message: "Product not found!" });
    }

    if (existingProduct.image) {
      const imagePath = path.join(
        __dirname,
        "../../../public/images/products",
        existingProduct.image
      );
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Image deletion failed:", err);
      });
    }

    let product = await productSchema.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ status: 200, message: "Delete product success!", data: product });
  } catch (error) {
    return res.status(400).json({
      status: 400,
      message: "Delete products failed!",
      error: error.message,
    });
  }
});

module.exports = router;
