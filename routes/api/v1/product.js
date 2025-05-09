var express = require("express");
var router = express.Router();
var productSchema = require("../../../models/product.model");
var orderSchema = require("../../../models/order.model");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const tokenMiddleware = require("../../../middleware/token.middleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/products");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", tokenMiddleware, async function (req, res, next) {
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

router.get("/:id", tokenMiddleware, async function (req, res, next) {
  try {
    let { id } = req.params;
    let product = await productSchema.findById(id);

    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found!",
        data: product,
      });
    }

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

router.post(
  "/",
  [tokenMiddleware, upload.single("image")],
  async function (req, res, next) {
    try {
      const { name, description, price, category, stock } = req.body;

      const imagePath = req.file ? req.file.filename : null;

      const product = new productSchema({
        name,
        description,
        price,
        category,
        stock,
        image: "../../../public/images/products" + imagePath,
      });

      await product.save();

      return res
        .status(201)
        .json({ status: 201, message: "Success!", data: product });
    } catch (error) {
      return res.status(400).json({
        status: 400,
        message: "Add products failed!",
        error: error.message,
      });
    }
  }
);

router.put(
  "/:id",
  tokenMiddleware,
  upload.single("image"),
  async function (req, res, next) {
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
  }
);

router.delete("/:id", tokenMiddleware, async function (req, res, next) {
  try {
    let { id } = req.params;

    const existingProduct = await productSchema.findById(id);

    if (!existingProduct) {
      return res.status(404).json({
        status: 404,
        message: "Product not found!",
        data: existingProduct,
      });
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

router.get("/:id/orders", tokenMiddleware, async function (req, res, next) {
  try {
    let { id } = req.params;

    const existingProduct = await productSchema.findById(id);

    if (!existingProduct) {
      return res.status(404).json({
        status: 404,
        message: "Product not found!",
        data: existingProduct,
      });
    }

    const order = await orderSchema
      .find({
        "items.product": id,
      })
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
      message: "Failed to retrieve orders.",
      error: error.message,
    });
  }
});

router.post("/:id/orders", tokenMiddleware, async function (req, res, next) {
  try {
    let { id } = req.params;

    const product = await productSchema.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ status: 404, message: "Product not found!", data: product });
    }

    const { quantity } = req.body;
    const user = req.user._id;

    if (!user || !quantity || quantity <= 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid user or quantity.",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        status: 400,
        message: "Not enough stock for product.",
        data: product,
      });
    }

    let items = { product: product, quantity };

    const order = new orderSchema({
      user,
      items,
    });

    await order.save();

    await productSchema.findByIdAndUpdate(id, {
      $inc: { stock: -quantity },
    });

    const populatedOrder = await orderSchema
      .findById(order._id)
      .populate("user", "firstName lastName email")
      .populate("items.product", "name image price stock")
      .sort({ createdAt: -1 })
      .exec();

    return res.status(201).json({
      status: 201,
      message: "Order added successfully.",
      data: populatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Failed to add orders.",
      error: error.message,
    });
  }
});

module.exports = router;
