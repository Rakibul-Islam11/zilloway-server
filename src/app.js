const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const createError = require("http-errors");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const userRoute = require("./routes/userRoutes");
const seedRouter = require("./routes/seedRouter");
const authRouter = require("./routes/authRouter");
const categoryRouter = require("./routes/categoryRouter");
const productRouter = require("./routes/productRouter");
const propertyRouter = require("./routes/propertyRouter");
const houseRentPostRouter = require("./routes/houseRentPost");
const sellProductRouter = require("./routes/sellProductRouter");
const jobRouter = require("./routes/jobPostRoutes");
const { errorResponse } = require("./controllers/responseController");

const app = express();

// ✅ CORS middleware (এটাই main fix)
app.use(
    cors({
        origin: [
            "https://zilloway.com", // তোমার main domain
            "https://zillu-web-development-live.web.app", // যদি firebase host থাকে
            "http://localhost:5173", // dev mode
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

// ✅ OPTIONS preflight handle
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

const rateLimter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 15,
    message: "Too many requests from this IP. Please try again later.",
});

app.get("/", (req, res) => {
    res.json({ success: true, message: "Server is running ✅" });
});

app.use("/api/users", userRoute);
app.use("/api/auth", authRouter);
app.use("/api/seed", seedRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/property", propertyRouter);
app.use("/api/house-rent-post", houseRentPostRouter);
app.use("/api/sell-product", sellProductRouter);
app.use("/api/job-posts", jobRouter);

// client error middleware
app.use((req, res, next) => {
    next(createError(404, "Route not found"));
});

// server error handling
app.use((err, req, res, next) => {
    return errorResponse(res, {
        statusCode: err.status || 500,
        message: err.message,
    });
});

module.exports = app;
