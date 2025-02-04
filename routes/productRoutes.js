const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Price = require('../models/Price');
const Store = require('../models/Store');

router.get('/GetProduct', async (req, res) => {
    try {
        const { search } = req.query;

        if (!search) {
            return res.status(400).json({ error: "Search term is required" });
        }

        // Find products using search_terms array
        const products = await Product.find({
            search_terms: search.toLowerCase() // Convert search term to lowercase
        });

        if (!products.length) {
            return res.json([]);
        }

        const productNums = products.map(p => p.product_num);

        // Find latest price for each product_num and store_num combination
        const latestPrices = await Price.aggregate([
            { $match: { product_num: { $in: productNums } } },
            { $sort: { date: -1 } }, // Sort descending by date (most recent first)
            {
                $group: {
                    _id: { product_num: "$product_num", store_num: "$store_num" },
                    latest_price: { $first: "$amount" }, // Use `amount` field for price
                    latest_date: { $first: "$date" }, // Get the latest date
                    unit: { $first: "$unit" } // Include unit information
                }
            }
        ]);

        // Fetch store details for unique store_nums
        const storeNums = [...new Set(latestPrices.map(p => p._id.store_num))];
        const stores = await Store.find({ store_num: { $in: storeNums } });

        // Create a lookup for store names
        const storeMap = stores.reduce((acc, store) => {
            acc[store.store_num] = store.store_name;
            return acc;
        }, {});

        // Fetch product details again but only selecting required fields (efficient lookup)
        const productDetails = await Product.find(
            { product_num: { $in: productNums } },
            { product_num: 1, product_name: 1, product_brand: 1, product_link: 1, image_url: 1, description: 1 }
        );

        // Create a lookup for product details
        const productMap = productDetails.reduce((acc, product) => {
            acc[product.product_num] = {
                product_name: product.product_name,
                product_brand: product.product_brand,
                product_link: product.product_link, // Ensures product link is included
                image_url: product.image_url,
                description: product.description
            };
            return acc;
        }, {});

        // Join product details with latest prices and store details
        const response = latestPrices.map(price => {
            const productInfo = productMap[price._id.product_num] || {};
            const storeName = storeMap[price._id.store_num] || "Unknown Store"; // Default if not found

            return {
                product_num: price._id.product_num,
                store_num: price._id.store_num,
                store_name: storeName,
                product_name: productInfo.product_name || "Unknown Product",
                product_brand: productInfo.product_brand || "Unknown Brand",
                product_link: productInfo.product_link || "", // Now properly included
                image_url: productInfo.image_url || "",
                description: productInfo.description || "",
                latest_price: price.latest_price,
                latest_date: price.latest_date,
                unit: price.unit
            };
        });

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
