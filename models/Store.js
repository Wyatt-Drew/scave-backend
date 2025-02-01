const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    store_name: { type: String, required: true },
    store_num: { type: String, required: true, unique: true },
    city: { type: String, required: true }
}, { collection: 'stores' });

module.exports = mongoose.model('Store', StoreSchema);
