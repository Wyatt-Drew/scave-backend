const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    product_num: String,
    product_name: String,
});

module.exports = mongoose.model('Product', ProductSchema);
