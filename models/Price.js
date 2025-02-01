const mongoose = require('mongoose');

const PriceSchema = new mongoose.Schema({
    product_num: String,
    store_num: String,
    price: Number,
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Price', PriceSchema);
