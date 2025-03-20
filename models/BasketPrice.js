const mongoose = require("mongoose");

const BasketPriceSchema = new mongoose.Schema({
    store_num: { type: String, required: true },
    basket_price: { type: Number, required: true },
    weekStart: { type: String, required: true },
    weekEnd: { type: String, required: true },
    uploaded_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BasketPrice", BasketPriceSchema, "basket_prices"); 
// Explicitly set collection name: "basket_prices"
