
const createError = require('http-errors')
const Product = require('../models/productModel');
const { default: slugify } = require('slugify');
const { publicIdWithoutExtensionFromUrl } = require('../helper/cloudinaryHelper');
const cloudinary = require('../config/cloudinary')
const fs = require('fs');

const createProduct = async (productData) => {
    const { name, description, price, category, quantity, shipping} =
        productData;
    const productExists = await Product.exists({ name: name });
    if (productExists) {
        throw createError(
            409,
            'Product with this name already exists.'
        );
    }
    // create product
    const product = await Product.create({
        name: name,
        slug: slugify(name),
        description: description,
        price: price,
        quantity: quantity,
        shipping: shipping,
        // image: imageBufferString,
        category: category
    })

    return product;
};
const getProducts = async (page = 1, limit = 4, filter={}) => {

    
    const products = await Product.find(filter)
        .populate('category')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

    if (!products) throw createError(404, 'no products found');

    const count = await Product.find(filter).
        countDocuments();
    
    return { products, count };
};
const getProductBySlug = async (slug) => {
    const product = await Product.findOne({ slug }).populate('category');
    if (!product) throw createError(404, 'no products found');
    return product;
};
const deleteProductBySlug = async (slug) => {
    try {
        // ✅ Step 1: Product খুঁজে বের করো
        const existingProduct = await Product.findOne({ slug });
        if (!existingProduct) throw createError(404, 'No product found');

        // ✅ Step 2: Cloudinary image delete করো
        if (existingProduct.image) {
            const publicId = await publicIdWithoutExtensionFromUrl(existingProduct.image);
            const { result } = await cloudinary.uploader.destroy(
                `ecommerceMern/products/${publicId}`
            );

            console.log('Cloudinary delete result:', result);

            if (result !== 'ok') {
                throw new Error('Product image was not deleted successfully from Cloudinary.');
            }
        }

        // ✅ Step 3: Database থেকে product delete করো
        await Product.findOneAndDelete({ slug });

        return existingProduct; // success response এর জন্য
    } catch (error) {
        throw error;
    }
};
const updateProductBySlug = async (slug, updates, updateOptions, imageFile) => {
    try {
        // 🟢 1️⃣ প্রথমে পুরনো প্রোডাক্ট খুঁজে বের করো
        const existingProduct = await Product.findOne({ slug });
        if (!existingProduct) throw createError(404, 'Product not found');

        // 🟢 2️⃣ যদি name আপডেট হয় তাহলে slug ও আপডেট করো
        if (updates.name) {
            updates.slug = slugify(updates.name);
        }

        // 🟢 3️⃣ যদি নতুন image আসে (multer এর মাধ্যমে)
        if (imageFile) {
            // Cloudinary-তে পুরনো image ডিলিট করো (যদি থাকে)
            if (existingProduct.image) {
                const oldPublicId = await publicIdWithoutExtensionFromUrl(existingProduct.image);
                await cloudinary.uploader.destroy(`ecommerceMern/products/${oldPublicId}`);
            }

            // নতুন image upload করো
            const uploadResult = await cloudinary.uploader.upload(imageFile.path, {
                folder: "ecommerceMern/products",
                use_filename: true,
                unique_filename: true,
            });

            // uploaded image URL product-এ সেট করো
            updates.image = uploadResult.secure_url;

            // লোকাল ফাইল delete করো (multer যে temp folder এ রেখেছিল)
            fs.unlinkSync(imageFile.path);
        }

        // 🟢 4️⃣ Database update করো
        const updatedProduct = await Product.findOneAndUpdate({ slug }, updates, updateOptions);
        if (!updatedProduct) throw createError(404, 'Product not found during update');

        return updatedProduct;
    } catch (error) {
        throw error;
    }
};

module.exports = { createProduct, getProducts, getProductBySlug, deleteProductBySlug, updateProductBySlug };
