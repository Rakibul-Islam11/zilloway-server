
const cloudinary = require("../config/cloudinary");
const createError = require("http-errors");
const RentPost = require("../models/rentPostModel");

const { successResponse } = require("./responseController");
const { default: mongoose } = require("mongoose");
const { findRentPost } = require("../services/houseRentPostService");

// Upload single image to Cloudinary
const handleHouseRentImgaePost = async (req, res, next) => {
    try {
        if (!req.file) throw createError(400, "No image file provided");

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "ecommerceMe/houseRentImages" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        res.status(200).json({
            status: "success",
            payload: { imageUrl: result.secure_url }
        });
    } catch (error) {
        next(error);
    }
};

// Publish Rent Post
const handleHouseRentPost = async (req, res, next) => {
    try {
        const { formData } = req.body;
        if (!formData) throw createError(400, "Form data is required");

        // Parse JSON if sent as string
        let parsedData = typeof formData === "string" ? JSON.parse(formData) : formData;

        const newPost = await RentPost.create({
            ...parsedData,
            userId: req.user._id,  // logged-in user
            ban: false,
            status: "approved",
        });

        res.status(201).json({
            status: "success",
            message: "Post created successfully",
            payload: newPost
        });
    } catch (error) {
        next(error);
    }
};


const handleGetHouseRentPost = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;


        const { users, pagination } = await findRentPost(search, limit, page);

        return successResponse(res, {
            statusCode: 200,
            message: 'rent post returnd',
            payload: {
                users: users,
                pagination: pagination
            }
        })
    } catch (error) {
        next(error)
    }
};

// Get single rent post by ID
const handleGetHouseRentPostById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose .Types.ObjectId.isValid(id)) {
            throw createError(400, "Invalid post ID");
        }

        const post = await RentPost.findById(id);

        if (!post) {
            throw createError(404, "Rent post not found");
        }

        return successResponse(res, {
            statusCode: 200,
            message: 'Rent post retrieved successfully',
            payload: {
                post: post
            }
        });
    } catch (error) {
        next(error);
    }
};
module.exports = { handleHouseRentImgaePost, handleHouseRentPost, handleGetHouseRentPost, handleGetHouseRentPostById };
