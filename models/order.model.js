const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", async function (next) {
  try {
    if (this.isNew || this.isModified("items")) {
      let total = 0;

      for (const item of this.items) {
        const product = await mongoose.model("products").findById(item.product);
        if (!product) {
          throw new Error(`Product not found: ${item.product}`);
        }

        total += item.quantity * product.price;
      }

      this.totalPrice = total;
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("orders", orderSchema);
