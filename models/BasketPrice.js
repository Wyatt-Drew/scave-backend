const mongoose = require("mongoose");

const BasketPriceSchema = new mongoose.Schema({
  store_num: { type: String, required: true },
  basket_price: { type: Number, required: true },
  date: { type: Date, required: true } // 🧠 Represents the pricing Wednesday
});

module.exports = mongoose.model("BasketPrice", BasketPriceSchema, "basket_prices");
