const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    product_num: { type: String, required: true },
    product_name: { type: String, required: true },
    parent_company: { type: String }, // Add this
    product_brand: { type: String },
    product_link: { type: String },
    image_url: { type: String },
    description: { type: String },
    search_terms: { type: [String] } // Add search terms
});

module.exports = mongoose.model('Product', ProductSchema);
