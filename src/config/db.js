// src/config/db.js
const mongoose = require("mongoose");
const logger = require("../controllers/loggerController") || console;

const MONGODB_URI = process.env.MONGODB_ATLAS_URL;

let isConnected = false; // <-- Track connection state

const connectDatabase = async (opts = {}) => {
    if (isConnected) {
        logger.log?.("info", "🔁 Using existing MongoDB connection");
        return mongoose;
    }

    if (!MONGODB_URI) {
        logger.error?.("error", "❌ MONGODB_ATLAS_URL not set in environment variables");
        throw new Error("Missing MongoDB URI");
    }

    try {
        const conn = await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ...opts,
        });
        isConnected = conn.connections[0].readyState === 1;
        logger.log?.("info", `✅ MongoDB connected: ${conn.connection.host}`);
        return mongoose;
    } catch (err) {
        logger.error?.("error", "❌ MongoDB connection failed:", err.message);
        throw err;
    }
};

module.exports = connectDatabase;
