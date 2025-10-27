const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const { defaultImagePath } = require("../secretCredential");

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        // required: [true, 'First Name is required'],
        trim: true,
        minlength: [2, "Minimum 2 characters required"],
        maxlength: [50, "Maximum 50 characters allowed"]
    },
    lastName: {
        type: String,
        // required: [true, 'Last Name is required'],
        trim: true,
        minlength: [2, "Minimum 2 characters required"],
        maxlength: [50, "Maximum 50 characters allowed"]
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v);
            },
            message: 'Please enter a valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        trim: true,
        minlength: [6, "Password must be at least 6 characters"],
        set: (v) => bcrypt.hashSync(v, bcrypt.genSaltSync(10))
    },
    phone: {
        type: String,
        trim: true,
        set: (v) => v.replace(/\D/g, "") // remove all non-digit characters
    },

    professionalType: {
        type: String,
        // required: [true, "Professional type is required"],
        enum: ["Agent"], // চাইলে dynamic করবেন

    },
    zipCode: {
        type: String,
        // required: [true, "Zip / Postal Code is required"],
        trim: true,
        minlength: [4, "Minimum 4 characters"],
        maxlength: [10, "Maximum 10 characters"]
    },
    address: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        default: "https://i.ibb.co.com/7xCNx0Y0/avatar-1.png",
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isBanned: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const User = model('Users', userSchema);
module.exports = User;
