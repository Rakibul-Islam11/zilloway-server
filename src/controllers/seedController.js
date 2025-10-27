const data = require("../data");
const User = require("../models/userModel")
const Product = require("../models/productModel")

const seedUser = async (req, res, next) => {
    try {
        console.log("Seeding started...");

        // Deleting all existing user
        await User.deleteMany({});
        console.log("All users deleted ✅");

        // Inserting new users
        const users = await User.insertMany(data.users);
        console.log("Users inserted ✅", users);

        return res.status(201).json(users);
    } catch (error) {
        console.error("Seeding error ❌", error);
        next(error);
    }
}
const seedProduts = async (req, res, next) => {
    try {
        console.log("Seeding started...");

        // Deleting all existing user
        await Product.deleteMany({});
        console.log("All users deleted ✅");

        // Inserting new users
        const products = await Product.insertMany(data.products);
        console.log("Users inserted ✅", products);

        return res.status(201).json(products);
    } catch (error) {
        console.error("Seeding error ❌", error);
        next(error);
    }
}

module.exports = { seedUser, seedProduts }