const createHttpError = require("http-errors");
const jwt = require('jsonwebtoken');
const User = require("../models/userModel");
const createError = require('http-errors');
const { createJSONWebToken } = require("../helper/jsonwebtoken");
const { jwtResetPasswordKey, clientUrl } = require("../secretCredential");
const emailWithNodeMailer = require("../helper/email");
const { publicIdWithoutExtensionFromUrl } = require("../helper/cloudinaryHelper");
const cloudinary = require('../config/cloudinary')
const fs = require("fs");


const findUsers = async (search, limit, page) => {
    try {
        const searchRegExp = new RegExp(".*" + search + ".*", 'i');

        const filter = {
            isAdmin: { $ne: true },
            $or: [
                { name: { $regex: searchRegExp } },
                { email: { $regex: searchRegExp } },
                { phone: { $regex: searchRegExp } },

            ],
        };
        const options = { password: 0 };



        const users = await User.find(filter, options)
            .limit(limit)
            .skip((page - 1) * limit)

        const count = await User.find(filter).countDocuments();
        if (!users) throw createError(404, 'no users found')

        return {
            users,
            pagination: {
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                previousPage: page - 1 > 0 ? page - 1 : null,
                nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
            },
        };
    } catch (error) {
        throw error
    }
    
}
const findUserById = async (id, options = {}) => {
    try {
        const user = await User.findById(id, options);
        if (!user) throw createError(404, 'User not found');
        return user;
    } catch (error) {
        throw error
    }
};

const deleteUserById = async (id, options = {}) => {
    try {
        const existingUser = await User.findOne({
            _id: id,
        });

        if (existingUser && existingUser.image) {
            try {
                let publicId = await publicIdWithoutExtensionFromUrl(existingUser.image);
                publicId = publicId.replace(/\.[^/.]+$/, ""); // remove .png, .jpg, etc.

                console.log("🖼 User Image URL:", existingUser.image);
                console.log("🧩 Clean Public ID:", publicId);


                const cloudinaryPath = `ecommerceMern/users/${publicId}`;
                console.log("🧩 Deleting from Cloudinary:", cloudinaryPath);

                const result = await cloudinary.uploader.destroy(cloudinaryPath);
                console.log("🧩 Cloudinary delete result:", result);

                if (result.result !== 'ok' && result.result !== 'not found') {
                    throw new Error('User image delete failed on Cloudinary');
                }

            } catch (err) {
                console.error("⚠️ Cloudinary delete error:", err.message);
            }
        }

        await User.findByIdAndDelete({
            _id: id,
            isAdmin: false,
        });

        const user = await User.findByIdAndDelete(id, options);
        if (!user) throw createError(404, 'User not found');
        return user;
    } catch (error) {
        throw error;
    }
};

const updateUserById = async (userId, req) => {
    try {
        // 🔹 1️⃣ Validate user exists
        const existingUser = await findUserById(userId, { password: 0 });
        if (!existingUser) throw createError(404, "User not found");

        const updateOptions = { new: true, runValidators: true, context: "query" };
        let updates = {};

        // 🔹 2️⃣ Allowable fields only
        const allowedFields = ["name", "password", "phone", "address"];
        for (const key in req.body) {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            } else if (key === "email") {
                throw createError(400, "Email cannot be updated");
            }
        }

        // 🔹 3️⃣ Handle image update if new image uploaded
        if (req.file) {
            // পুরনো image ডিলিট করো Cloudinary থেকে
            if (existingUser.image) {
                const oldPublicId = await publicIdWithoutExtensionFromUrl(existingUser.image);
                await cloudinary.uploader.destroy(`ecommerceMern/users/${oldPublicId}`);
            }

            // নতুন image upload করো Cloudinary তে
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                folder: "ecommerceMern/users",
                use_filename: true,
                unique_filename: true,
            });

            // Database update-এর জন্য নতুন image URL সেট করো
            updates.image = uploadResult.secure_url;

            // লোকাল temp ফাইল delete করো (multer থেকে)
            fs.unlinkSync(req.file.path);
        }

        // 🔹 4️⃣ Update user info in DB
        const updatedUser = await User.findByIdAndUpdate(userId, updates, updateOptions).select("-password");

        if (!updatedUser) throw createError(404, "User not found during update");

        return updatedUser;
    } catch (error) {
        throw error;
    }
};



const forgetPasswordByEmail = async (email) => {
    try {
        const userData = await User.findOne({ email: email });
        if (!userData) {
            throw createError(
                404,
                'Eamil is inocorrect or you have not verified your email address. Please register yourself first'
            );
        }
        //create jwt
        const token = createJSONWebToken({ email }, jwtResetPasswordKey, '10m')


        // prepare email
        const emailData = {
            email,
            subject: 'Reset Password Email',
            html: `
                <h2>Hello ${userData.name}!</h2>
                <p>
                Please click here to 
                <a href="${clientUrl}/api/users/reset-password/${token}" target="_blank">
                    reset your password
                </a>
                </p>
            `
        };


        //send email with nodemailer
        try {
            await emailWithNodeMailer(emailData);
            return token;
        } catch (emailError) {
            next(createError(500, 'Failed to send reset password email'));
            return;
        }
    } catch (error) {
        throw error;
    }
};
const resetPassword = async (token, password) => {
    try {
        const decoded = jwt.verify(token, jwtResetPasswordKey);

        if (!decoded) {
            throw createError(400, "Invalid or expired token");
        }

        const filter = { email: decoded.email };
        const update = { password: password };
        const options = { new: true };

        const updatedUser = await User.findOneAndUpdate(
            filter,
            update,
            options
        ).select('-password');

        if (!updatedUser) {
            throw createError(400, 'Password Reset Failed');
        }
    } catch (error) {
        throw error;
    }
};
const handleUserAction = async (userId, action) => {
    try {
        let update;
        let successMessage
        if (action === 'ban') {
            update = { isBanned: true };
            successMessage = "User was banned successfully"
        } else if (action === 'unban') {
            update = { isBanned: false };
            successMessage = "User was Unbanned successfully"
        } else {
            throw createHttpError(400, 'Invalid action. Use "ban" or "unban"');
        }


        const updateOptions = {
            new: true,
            runValidators: true,
            context: 'query'
        };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            update,
            updateOptions
        ).select("-password");

        if (!updatedUser) {
            throw createError(400, 'User was not banned successfully');
        }
        return successMessage
    } catch (error) {
        throw (error)
    }
};

module.exports = { handleUserAction, findUsers, findUserById, findUserById, deleteUserById, updateUserById, forgetPasswordByEmail, resetPassword }