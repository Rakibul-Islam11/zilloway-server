const createError = require("http-errors");
const SellProduct = require("../models/sellProductModel");
const RentPost = require("../models/rentPostModel");


const findSellPost = async (search = "", limit = 10, page = 1) => {
    try {
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

        return {
            users,
            pagination: {
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                previousPage: page > 1 ? page - 1 : null,
                nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
            },
        };
    } catch (error) {
        throw error;
    }
};

// ✅ RentPost এর জন্য সঠিক function
const findRentPost = async (search = "", limit = 10, page = 1) => {
    try {
        const searchRegExp = new RegExp(search, "i");

        const filter = {
            $or: [
                { "state.propertyType": { $regex: searchRegExp } },
                { "state.streetAddress": { $regex: searchRegExp } },
                { description: { $regex: searchRegExp } },
                { listedBy: { $regex: searchRegExp } },
            ],
        };

        const users = await RentPost.find(filter)
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await RentPost.countDocuments(filter);

        return {
            users,
            pagination: {
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                previousPage: page > 1 ? page - 1 : null,
                nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
            },
        };
    } catch (error) {
        throw error;
    }
};

module.exports = { findSellPost, findRentPost };
