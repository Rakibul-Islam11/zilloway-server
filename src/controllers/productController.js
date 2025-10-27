const mongoose = require("mongoose");
const { successResponse } = require("./responseController");
const { getProducts, getProductBySlug, deleteProductBySlug, updateProductBySlug, createProduct } = require('../services/productService');
const cloudinary = require('../config/cloudinary')
const Product = require("../models/productModel");
const { default: slugify } = require("slugify");
const fs = require('fs');

const handleCreateProduct = async (req, res, next) => {
    try {
        const { name, description, price, quantity, shipping, category } = req.body;
        const image = req.file;

        if (!image) {
            throw createError(400, 'Image file is required');
        }

        if (image.size > 1024 * 1024 * 2) {
            throw createError(400, 'File too large. Max 2MB allowed');
        }

        // 🔹 Cloudinary এ upload
        const result = await cloudinary.uploader.upload(image.path, {
            folder: 'ecommerceMern/products',
            use_filename: true,
            unique_filename: true
        });

        // 🔹 Local file delete করা
        fs.unlinkSync(image.path);

        // 🔹 Product create
        const product = await Product.create({
            name,
            slug: slugify(name),
            description,
            price,
            quantity,
            shipping,
            image: result.secure_url, // ✅ Cloudinary URL save করা
            category
        });

        return successResponse(res, {
            statusCode: 200,
            message: 'Product created successfully',
            payload: product
        });

    } catch (error) {
        next(error);
    }
};
const handleGetProducts = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const serachRegExp = new RegExp('.*' + search + '.*', 'i');
        const filter = {
            $or: [
                { name: { $regex: serachRegExp } },
                { email: { $regex: serachRegExp } },
                { phone: { $regex: serachRegExp } },
            ],
        };

        const productsData = await getProducts(page, limit, filter);
        
        
        return successResponse(res, {
            statusCode: 200,
            message: `retrun all the products`,
            payload: {
                products: productsData.products,
                pagination: {
                    totalPages: Math.ceil(productsData.count / limit),
                    currentPage: page,
                    previousPage: page - 1,
                    nextPage: page + 1,
                    totalNumberOfProducts: productsData.count,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};
const handleGetProduct = async (req, res, next) => {
    try {
        
        const { slug } = req.params;
        const product = await getProductBySlug(slug);
        return successResponse(res, {
            statusCode: 200,
            message: 'returned single product',
            payload: { product },
        });
    } catch (error) {
        next(error);
    }
};
const handleDeleteProduct = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const product = await deleteProductBySlug(slug);
        return successResponse(res, {
            statusCode: 200,
            message: 'Product deleted successfully',
            payload: { product },
        });
    } catch (error) {
        next(error);
    }
};


const handleUpdateProduct = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const updateOptions = { new: true, runValidators: true, context: 'query' };
        let updates = {};

        const allowedFields = ['name', 'description', 'price', 'sold', 'quantity', 'shipping'];
        for (const key in req.body) {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            }
        }

        // ✅ multer ফাইল পাওয়া গেলে তা পাঠাও service-এ
        const updatedProduct = await updateProductBySlug(slug, updates, updateOptions, req.file);

        return successResponse(res, {
            statusCode: 200,
            message: 'Product was updated successfully',
            payload: updatedProduct,
        });
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return next(createError(400, 'Invalid Id'));
        }
        next(error);
    }
};



module.exports = { handleCreateProduct, handleGetProducts, handleGetProduct, handleDeleteProduct, handleUpdateProduct }
