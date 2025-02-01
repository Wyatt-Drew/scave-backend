const mongoose = require('mongoose');

const PriceSchema = new mongoose.Schema({
    product_num: { type: String, required: true },
    store_num: { type: String, required: true },
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    price_per_unit: { type: Number },
    unit: { type: String },
    __v: { type: Number, default: 0 }
}, { collection: 'prices' });

module.exports = mongoose.model('Price', PriceSchema);
