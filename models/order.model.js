const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
      }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("orders", orderSchema);
