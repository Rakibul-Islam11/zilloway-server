const User = require("../models/userModel");
const createError = require('http-errors');
const bcrypt = require("bcryptjs");
const { successResponse } = require("./responseController");
const { createJSONWebToken } = require("../helper/jsonwebtoken");
const { jwtActivationKey, clientUrl, jwtResetKey, jwtAccessKey } = require("../secretCredential");
const jwt = require("jsonwebtoken");
const { handleUserAction, findUsers, findUserById, deleteUserById, updateUserById, forgetPasswordByEmail, resetPassword } = require("../services/userService");
const { default: mongoose } = require("mongoose");
const findWithId = require("../services/findItem");
const checkUserExists = require("../helper/checkUserExist");
const sendEmail = require("../helper/sendEmail");
const cloudinary = require("../config/cloudinary");


const handleGetUsers = async(req, res, next) => {
    try {
        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 2;

    
        const {users, pagination} = await findUsers(search, limit, page);

        return successResponse(res, {
            statusCode: 200,
            message: 'user is retrund',
            payload: {
                users: users,
                pagination: pagination
            }
        })
    } catch (error) {
        next(error)
    }
}

const handleGetUserById = async(req, res, next) => {
    try {
        const id = req.params.id;
        const options = { password: 0 };
        const findUser = await findUserById(id, options);

        return successResponse(res, {
            statusCode: 200,
            message: 'user is retrund',
            payload: {
                findUser
            }
        })
    } catch (error) {
        next(error)
    }
}
const handleDeleteUserById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const options = { password: 0 };
        await deleteUserById(id, options);
        return successResponse(res, {
            statusCode: 200,
            message: 'user was deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

const handleProcessRegister = async (req, res, next) => {
    try {
        const { name, email, password, phone, zipCode, professionalType } = req.body;



        const userExists = await checkUserExists(email);
        if (userExists) {
            throw createError(409, "User with this email already exists. Please login.");
        }

        // ✅ Create activation token (10 minutes validity)
        const token = createJSONWebToken(
            { name, email, password, phone, zipCode, professionalType },
            jwtActivationKey,
            '10m'
        );


        // ✅ Generate activation URL for frontend
        const verificationUrl = `${clientUrl}/activate-account-success?token=${token}`;

        // ✅ Prepare email template
        const emailData = {
            email,
            subject: 'Account Activation Email',
            html: `
                <h2>Hello ${name}!</h2>
                <p>Please click the button below to activate your account:</p>
                <a href="${verificationUrl}" target="_blank"
                    style="
                        display:inline-block;
                        padding:10px 20px;
                        background-color:#2563eb;
                        color:#fff;
                        text-decoration:none;
                        border-radius:6px;
                        margin-top:10px;
                    ">
                    Activate My Account
                </a>
                <p>This link will expire in 10 minutes.</p>
            `
        };

        // ✅ Send email
        await sendEmail(emailData);

        return successResponse(res, {
            statusCode: 200,
            message: `Please check your inbox (${email}) to verify your account.`,
            payload: { token }
        });
    } catch (error) {
        next(error);
    }
};




const handleActivteUserAccount = async (req, res, next) => {
    try {
        const token = req.body.token;
        if (!token) throw createError(404, "Token not found");

        let decoded;
        try {
            decoded = jwt.verify(token, jwtActivationKey);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                throw createError(401, "Token has expired");
            } else if (error.name === "JsonWebTokenError") {
                throw createError(401, "Invalid Token");
            } else {
                throw error;
            }
        }

        // 🔍 Check if user already exists
        const existingUser = await User.findOne({ email: decoded.email });
        if (existingUser) {
            return successResponse(res, {
                statusCode: 200,
                message: "Your account is already verified. Please log in.",
            });
        }

        // ✅ Image থাকলে upload করো
        if (decoded.image) {
            try {
                const response = await cloudinary.uploader.upload(decoded.image, {
                    folder: 'ecommerceMern/users',
                });
                decoded.image = response.secure_url;
            } catch (uploadErr) {
                console.error("Cloudinary upload failed:", uploadErr);
                throw createError(500, "Image upload failed");
            }
        }

        // ✅ নতুন user তৈরি করো
        let newUser;
        try {
            newUser = await User.create(decoded);
        } catch (err) {
            if (err.code === 11000) {
                return successResponse(res, {
                    statusCode: 200,
                    message: "Your account is already activated. Please log in.",
                });
            }
            throw err;
        }

        // ✅ Auto Login: Create access token for the new user
        const accessToken = createJSONWebToken(
            {
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone,
                    address: newUser.address,
                    isAdmin: newUser.isAdmin,
                    isBanned: newUser.isBanned
                }
            },
            jwtAccessKey,
            '15m'
        );

        // ✅ Auto Login: Create refresh token
        const refreshToken = createJSONWebToken(
            {
                user: {
                    _id: newUser._id,
                    email: newUser.email
                }
            },
            jwtAccessKey,
            '7d'
        );

        // ✅ Set cookies
        res.cookie('accessToken', accessToken, {
            maxAge: 15 * 60 * 1000, // 15 minutes
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.cookie('refreshToken', refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return successResponse(res, {
            statusCode: 201,
            message: "Account activated successfully! You are now logged in.",
            payload: {
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone,
                    address: newUser.address,
                    isAdmin: newUser.isAdmin,
                    isBanned: newUser.isBanned
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};



const handleUpdateUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;

        if (req.user._id.toString() !== userId.toString()) {
            throw createError(403, "You are not allowed to update another user's information");
        }

        const updatedUser = await updateUserById(userId, req);

        return successResponse(res, {
            statusCode: 200,
            message: "User information updated successfully",
            payload: updatedUser,
        });
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            throw createError(400, "Invalid Id");
        }
        next(error);
    }
};


const handleUpdatePassword = async (req, res, next) => {
    try {
        console.log("REQ BODY:", req.body);
        const {  oldPassword, newPassword } = req.body;
        const userId = req.params.id;
        const user = await findWithId(User, userId);

        // compare the password
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isPasswordMatch) {
            throw createError(400, 'old password is not match');
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: newPassword },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            throw createError(400, 'User was not updated successfully');
        }
        return successResponse(res, {
            statusCode: 200,
            message: 'User was updated successfully',
            payload: { updatedUser },
        });
    } catch (error) {
        next(error);
    }
};
const handleForgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // 1️⃣ user আছে কি না, সেই অনুযায়ী token generate করবে
        const token = createJSONWebToken({ email }, jwtResetKey, '10m');

        // 2️⃣ reset link তৈরি করো (frontend URL সহ)
        const resetURL = `${clientUrl}/reset-password-land-page?token=${token}&email=${email}`;

        // 3️⃣ ইমেইল পাঠানো (sendEmail helper ব্যবহার করে)
        await sendEmail({
            email,
            subject: "Password Reset Request",
            html: `
                <div style="font-family:Arial, sans-serif; line-height:1.6; color:#333">
                    <h2>Password Reset Request</h2>
                    <p>Hi,</p>
                    <p>You recently requested to reset your password for your account. Click the button below to reset it:</p>
                    <a href="${resetURL}" 
                       style="display:inline-block; padding:10px 20px; background-color:#007bff; color:#fff; text-decoration:none; border-radius:5px;"
                    >Reset Password</a>
                    <p>If you did not request this, please ignore this email.</p>
                    <p>Thank you,<br/>Zilloway Team</p>
                </div>
            `,
        });

        // 4️⃣ Response পাঠাও
        return successResponse(res, {
            statusCode: 200,
            message: `Password reset email sent to ${email}. Please check your inbox.`,
            payload: { resetURL }, // debugging এর জন্য optional
        });
    } catch (error) {
        next(error);
    }
};


const handleResetPassword = async (req, res, next) => {
    try {
        const { token, email, password } = req.body;

        if (!token || !email || !password) {
            throw createError(400, "Invalid request");
        }

        // ✅ Verify reset token with jwtResetKey
        const decoded = jwt.verify(token, jwtResetKey);
        if (decoded.email !== email) {
            throw createError(401, "Invalid token or email");
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw createError(404, "User not found");
        }

        user.password = password;
        await user.save();

        return successResponse(res, {
            statusCode: 200,
            message: "Password reset successful",
        });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            next(createError(401, "Reset link has expired"));
        } else {
            next(error);
        }
    }
};


const handleManageUserStatusById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const action = req.body.action;

        
        const successMessage = await handleUserAction(userId,action );

        return successResponse(res, {
            statusCode: 200,
            message: successMessage,
        });
    } catch (error) {
        next(error);
    }
};
const handleResendVerificationEmail = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw createError(400, "Email is required");
        }

        // ইউজার আগে থেকেই আছে কিনা চেক করো
        const userExists = await User.findOne({ email });
        if (userExists) {
            throw createError(409, "User already verified. Please sign in.");
        }

        // আগের মতোই নতুন token তৈরি করো
        const token = createJSONWebToken({ email }, jwtActivationKey, "10m");

        // নতুন activation link তৈরি করো
        const verificationUrl = `${clientUrl}/activate-account-success?token=${token}`;

        // Email prepare
        const emailData = {
            email,
            subject: "Resend Account Verification Email",
            html: `
                <h2>Hello!</h2>
                <p>Please click the button below to activate your account:</p>
                <a href="${verificationUrl}" target="_blank"
                    style="
                        display:inline-block;
                        padding:10px 20px;
                        background-color:#2563eb;
                        color:#fff;
                        text-decoration:none;
                        border-radius:6px;
                        margin-top:10px;
                    ">
                    Activate My Account
                </a>
                <p>This link will expire in 10 minutes.</p>
            `
        };

        await sendEmail(emailData);

        return successResponse(res, {
            statusCode: 200,
            message: `A new verification email has been sent to ${email}. Please check your inbox.`,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { handleGetUsers, handleGetUserById, handleDeleteUserById, handleProcessRegister, handleActivteUserAccount, handleUpdateUserById, handleManageUserStatusById, handleUpdatePassword, handleForgetPassword, handleResetPassword, handleResendVerificationEmail }
