require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ Debugging: Log every incoming request
app.use((req, res, next) => {
    console.log(`➡️ Received request: ${req.method} ${req.url}`);
    next();
});

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Import Routes
const productRoutes = require("./routes/productRoutes");  
app.use("/api", productRoutes);  // ✅ Now all routes work under `/api`

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
