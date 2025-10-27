const { Schema, model } = require("mongoose");

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'product name is required'],
        trim: true,
        unique: true,
        minlength: [3, "product name must be at least 3 characters"],
        maxlength: [130, "product name can be max 130 characters"],
    },
    slug: {
        type: String,
        required: [true, 'slug is required'],
        lowercase: true,
        unique: true,
    },
    description: {
        type: String,
        required: [true, 'product description is required'],
        trim: true,
    },
    image: {
        type: String, // ✅ Buffer থেকে String করা হলো
        required: [true, 'Product image is required'],
    },
    price: {
        type: Number,
        required: [true, 'product price is required'],
        validate: {
            validator: (v) => v > 0,
            message: (props) =>
                `${props.value} is not a valid price! Price must be greater than 0`,
        },
    },
    quantity: {
        type: Number,
        required: [true, 'product quantity is required'],
        validate: {
            validator: (v) => v > 0,
            message: (props) =>
                `${props.value} is not a valid quantity! quantity must be greater than 0`,
        },
    },
    sold: {
        type: Number,
        default: 0,
        validate: {
            validator: (v) => v >= 0,
            message: (props) =>
                `${props.value} is not a valid sold quantity! sold must be >= 0`,
        },
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: false, // 👈 আপাতত optional রাখুন
    },
}, { timestamps: true });

const Product = model('Product', productSchema);
module.exports = Product;
