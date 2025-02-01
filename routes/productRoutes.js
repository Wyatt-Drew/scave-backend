const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Price = require('../models/Price');

router.get('/GetProduct', async (req, res) => {
    try {
        const { search } = req.query;

        if (!search) {
            return res.status(400).json({ error: "Search term is required" });
        }

        // Find products using the optimized `search_terms` field
        const products = await Product.find({
            search_terms: search.toLowerCase() // Ensure case-insensitive search
        });

        if (!products.length) {
            return res.json([]);
        }

        const productNums = products.map(p => p.product_num);

        // Find latest price for each product_num and store_num combination
        const latestPrices = await Price.aggregate([
            { $match: { product_num: { $in: productNums } } },
            { $sort: { updated_at: -1 } }, // Sort descending by updated_at
            {
                $group: {
                    _id: { product_num: "$product_num", store_num: "$store_num" },
                    latest_price: { $first: "$price" },
                    updated_at: { $first: "$updated_at" }
                }
            }
        ]);

        res.json(latestPrices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
