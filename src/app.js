const express = require("express");
const cookieParser = require('cookie-parser');
const morgan = require("morgan")
const createError = require('http-errors')
const rateLimit = require('express-rate-limit');
const userRoute = require("./routes/userRoutes");
const seedRouter = require("./routes/seedRouter");
const { errorResponse } = require("./controllers/responseController");

const cors = require("cors");
const authRouter = require("./routes/authRouter");
const categoryRouter = require("./routes/categoryRouter");
const productRouter = require("./routes/productRouter");
const propertyRouter = require("./routes/propertyRouter");
const houseRentPostRouter = require("./routes/houseRentPost");
const sellProductRouter = require("./routes/sellProductRouter");
const jobRouter = require("./routes/jobPostRoutes");

const app = express();

//!middleware start
// Middleware
app.use(
    cors({
        origin: [
            "https://zilloway.com",
            "https://zillu-web-development-live.web.app",
            "http://localhost:5173",
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// ✅ Render-compatible preflight

app.use(express.json()); // JSON body পার্স করবে
app.use(express.urlencoded({ extended: true })); // form-data/x-www-form-urlencoded body পার্স করবে
const rateLimter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 15, // Limit each IP to 15 requests per `window` (here, per 1 minutes)
    message: 'Too many request from this ip. please try again later'
})
app.use(cookieParser());
app.use(morgan('dev'))


app.get("/", (req, res) => {
    res.json({ success: true, message: "Server is running" });
});


app.use('/api/users', userRoute)
app.use('/api/auth', authRouter)
app.use('/api/seed', seedRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/products', productRouter)
app.use('/api/property', propertyRouter)
app.use('/api/house-rent-post', houseRentPostRouter)
app.use('/api/sell-product', sellProductRouter)
app.use('/api/job-posts', jobRouter)


//!middleware end



//demo api
app.get('/products', rateLimter, (req, res) => {
    res.status(300).send('product retrund')
})



//client error middleware
app.use((req, res, next) => {
    next(createError(404, 'route not found'))
})

// server error handling → handle all the errors
app.use((err, req, res, next) => {
    return errorResponse(res, {
        statusCode: err.status,
        message: err.message,
    });
});



module.exports = app;

