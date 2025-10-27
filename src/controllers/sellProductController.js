const createError = require("http-errors");
const { default: mongoose } = require("mongoose");
const cloudinary = require("../config/cloudinary");
const SellProduct = require("../models/sellProductModel");
const { findSellPost } = require("../services/houseRentPostService");
const { successResponse } = require("./responseController");

const handlePostSellProduct = async (req, res, next) => {
    try {
        const {
            category,
            condition,
            productName,
            brand,
            price,
            negotiable,
            phoneNumber,
            hideNumber,
            description,
            userId,
            location, // <-- এটা string হিসেবে আসবে
        } = req.body;

        if (!req.files || req.files.length === 0)
            throw createError(400, "No image files provided");

        // Cloudinary upload
        const uploadedImages = await Promise.all(
            req.files.map(async (file, index) => {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "ecommerceMe/sellProductImages" },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(file.buffer);
                });
                return {
                    url: result.secure_url,
                    isPrimary: index === 0,
                };
            })
        );

        // 🧠 Fix: location কে object আকারে সেট করা
        const locationObj = {
            address: location,
            lat: null,
            lng: null,
        };

        // MongoDB save
        const newProduct = await SellProduct.create({
            category,
            condition,
            productName,
            brand,
            price,
            negotiable: negotiable === "true" || negotiable === true,
            phoneNumber,
            hideNumber: hideNumber === "true" || hideNumber === true,
            description,
            images: uploadedImages,
            userId,
            location: locationObj,
        });

        res.status(201).json({ status: "success", payload: newProduct });
    } catch (error) {
        next(error);
    }
};

const handleGetSellProductSlider = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const { users, pagination } = await findSellPost(search, limit, page);

        return successResponse(res, {
            statusCode: 200,
            message: "Sell products returned",
            payload: { users, pagination },
        });
    } catch (error) {
        next(error);
    }
};
const handleGetAllSellProduct = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const searchRegExp = new RegExp(search, "i");

        const filter = {
            $or: [
                { productName: { $regex: searchRegExp } },
                { brand: { $regex: searchRegExp } },
                { category: { $regex: searchRegExp } },
                { description: { $regex: searchRegExp } },
            ],
        };

        const users = await SellProduct.find(filter)
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await SellProduct.countDocuments(filter);

        const pagination = {
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            previousPage: page > 1 ? page - 1 : null,
            nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
        };

        return successResponse(res, {
            statusCode: 200,
            message: "All sell products returned successfully",
            payload: { users, pagination },
        });
    } catch (error) {
        next(error);
    }
};

const handleGetSellProductForDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if ID is valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createError(400, "Invalid product ID");
        }

        // Find product by ID
        const product = await SellProduct.findById(id);

        if (!product) {
            throw createError(404, "Product not found");
        }

        return successResponse(res, {
            statusCode: 200,
            message: 'Product retrieved successfully',
            payload: {
                post: product
            }
        });
    } catch (error) {
        next(error);
    }
};


module.exports = { handlePostSellProduct, handleGetSellProductSlider, handleGetAllSellProduct, handleGetSellProductForDetails };
