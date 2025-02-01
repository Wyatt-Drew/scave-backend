const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    product_num: { type: String, required: true },
    parent_company: { type: String, required: true },
    product_brand: { type: String, required: true },
    product_name: { type: String, required: true },
    product_link: { type: String },
    image_url: { type: String },
    description: { type: String },
    search_terms: { type: [String], default: [] },
    __v: { type: Number, default: 0 }
}, { collection: 'products' });

module.exports = mongoose.model('Product', ProductSchema);
