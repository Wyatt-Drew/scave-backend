const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Price = require("../models/Price");
const Store = require("../models/Store");
const BasketPrice = require("../models/BasketPrice"); // ✅ Ensure this model exists!

router.get("/prices/GetProductHistory", async (req, res) => {
    try {
        const { product_num } = req.query;

        if (!product_num) {
            return res.status(400).json({ error: "Product number is required" });
        }

        console.log(`🔍 Fetching price history for product: ${product_num}`);

        const today = new Date();
        const fifteenWeeksAgo = new Date();
        fifteenWeeksAgo.setDate(today.getDate() - 15 * 7); // 15 weeks back

        console.log(`📅 Date Range: ${fifteenWeeksAgo.toISOString()} - ${today.toISOString()}`);

        // ✅ Query `prices` collection for raw data (not averages)
        const priceHistory = await Price.find(
            { 
                product_num: product_num,
                date: { $gte: fifteenWeeksAgo, $lte: today }
            },
            { store_num: 1, date: 1, amount: 1, price_per_unit: 1, unit: 1, _id: 0 } // ✅ Return raw price data
        ).sort({ store_num: 1, date: -1 }); // ✅ Sort by store, then date

        console.log(`📊 Found ${priceHistory.length} price records`);

        if (!priceHistory.length) {
            console.log("⚠️ No price history found");
            return res.json({ message: "No price history found for this product." });
        }

        res.json(priceHistory);
    } catch (error) {
        console.error("❌ Error fetching product price history:", error);
        res.status(500).json({ error: "Server error" });
    }
});


// ✅ Get Product API
router.get('/products/GetProduct', async (req, res) => {
    try {
        const { search } = req.query;

        if (!search) {
            return res.status(400).json({ error: "Search term is required" });
        }

        // Find products using search_terms array
        const products = await Product.find({
            search_terms: search.toLowerCase() 
        });

        if (!products.length) {
            return res.json([]);
        }

        const productNums = products.map(p => p.product_num);

        // Find latest price for each product_num and store_num combination
        const latestPrices = await Price.aggregate([
            { $match: { product_num: { $in: productNums } } },
            { $sort: { date: -1 } },
            {
                $group: {
                    _id: { product_num: "$product_num", store_num: "$store_num" },
                    latest_price: { $first: "$amount" },
                    latest_date: { $first: "$date" },
                    unit: { $first: "$unit" }
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
                product_link: product.product_link,
                image_url: product.image_url,
                description: product.description
            };
            return acc;
        }, {});

        // Join product details with latest prices and store details
        const response = latestPrices.map(price => {
            const productInfo = productMap[price._id.product_num] || {};
            const storeName = storeMap[price._id.store_num] || "Unknown Store";

            return {
                product_num: price._id.product_num,
                store_num: price._id.store_num,
                store_name: storeName,
                product_name: productInfo.product_name || "Unknown Product",
                product_brand: productInfo.product_brand || "Unknown Brand",
                product_link: productInfo.product_link || "",
                image_url: productInfo.image_url || "",
                description: productInfo.description || "",
                latest_price: price.latest_price,
                latest_date: price.latest_date,
                unit: price.unit
            };
        });

        res.json(response);
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get Basket Prices API
router.get("/baskets/GetBasketPrices", async (req, res) => {
    try {
        const today = new Date();
        const fifteenWeeksAgo = new Date();
        fifteenWeeksAgo.setDate(today.getDate() - 15 * 7);

        console.log(`🔍 Fetching basket prices from ${fifteenWeeksAgo.toISOString()} to ${today.toISOString()}`);

        // ✅ Query the `basket_prices` collection
        const basketPrices = await BasketPrice.aggregate([
            { 
                $match: { 
                    uploaded_at: { $gte: fifteenWeeksAgo, $lte: today }
                }
            },
            { $sort: { uploaded_at: -1 } },
            { 
                $group: {
                    _id: { store_num: "$store_num", weekStart: "$weekStart", weekEnd: "$weekEnd" },
                    basket_price: { $first: "$basket_price" },
                    latest_upload: { $first: "$uploaded_at" }
                }
            },
            { 
                $project: {
                    _id: 0,
                    store_num: "$_id.store_num",
                    weekStart: "$_id.weekStart",
                    weekEnd: "$_id.weekEnd",
                    basket_price: 1,
                    latest_upload: 1
                }
            },
            { $sort: { store_num: 1, weekStart: -1 } }
        ]);

        if (!basketPrices.length) {
            return res.json({ message: "No basket prices found in the last 15 weeks." });
        }

        res.json(basketPrices);
    } catch (error) {
        console.error("❌ Error fetching basket prices:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
