// require("dotenv").config(); // ✅ Load env variables first
// const app = require("./app");
// const connectDatabase = require("./config/db");
// const logger = require("./controllers/loggerController");
// const { serverPort } = require("./secretCredential");

// const startServer = async () => {
//     try {
//         await connectDatabase();
//         app.listen(serverPort, () => {
//             logger.log("info", `✅ Server running at http://localhost:${serverPort}`);
//         });
//     } catch (error) {
//         logger.log("error", "❌ Failed to start server:", error);
//         process.exit(1);
//     }
// };

// startServer();






//!>>>>>>>>>>>>>>>
// require("dotenv").config();
// const app = require("./app");
// const connectDatabase = require("./config/db");
// const logger = require("./controllers/loggerController");

// ✅ ডাটাবেজ কানেক্ট একবারই হবে
// connectDatabase()
//     .then(() => logger.log("info", "✅ MongoDB connected successfully"))
//     .catch((error) => {
//         logger.log("error", "❌ MongoDB connection failed:", error);
//     });

// // ✅ Vercel serverless handler হিসেবে express app export করো
// module.exports = app;

//!>>>>>>>>>>>>









// src/server.js
require("dotenv").config();
const express = require("express");
const connectDatabase = require("./config/db");
const logger = require("./controllers/loggerController");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = require("./app"); // তোমার Express app

// ✅ Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// ✅ PORT - Render automatically provides process.env.PORT
const PORT = process.env.PORT || 3001;

// ✅ MongoDB connection
connectDatabase()
    .then(() => logger.log("info", "✅ MongoDB connected successfully"))
    .catch((error) => logger.log("error", "❌ MongoDB connection failed:", error));

// ✅ Start server
app.listen(PORT, () => {
    logger.log("info", `🚀 Server running on port ${PORT}`);
    console.log(`🚀 Server running on port ${PORT}`);
});
