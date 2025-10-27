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
require("dotenv").config();
const app = require("./app");
const connectDatabase = require("./config/db");
const logger = require("./controllers/loggerController");

// ✅ ডাটাবেজ কানেক্ট একবারই হবে
connectDatabase()
    .then(() => logger.log("info", "✅ MongoDB connected successfully"))
    .catch((error) => {
        logger.log("error", "❌ MongoDB connection failed:", error);
    });

// ✅ Vercel serverless handler হিসেবে express app export করো
module.exports = app;

//!>>>>>>>>>>>>
