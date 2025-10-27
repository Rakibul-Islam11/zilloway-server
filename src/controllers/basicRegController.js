const User = require("../models/userModel");
const createError = require("http-errors");
const checkUserExists = require("../helper/checkUserExist");
const { successResponse } = require("./responseController");
const { createJSONWebToken } = require("../helper/jsonwebtoken");
const { jwtAccessKey, jwtRefreshKey } = require("../secretCredential");

const handleBasicRegister = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const userExists = await checkUserExists(email);
        if (userExists) {
            throw createError(409, "User with this email already exists. Please login.");
        }

        // Create new user (without email verification)
        const newUser = await User.create({
            email,
            password,
            name: email.split('@')[0], // Default name from email
            isVerified: true // Directly verified for basic registration
        });

        // ✅ Auto Login: Create access token
        const accessToken = createJSONWebToken(
            {
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    isAdmin: newUser.isAdmin,
                    isBanned: newUser.isBanned,
                    isVerified: newUser.isVerified
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

        // ✅ Set cookies for auto login
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
            message: "Registration successful! You are now logged in.",
            payload: {
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    isAdmin: newUser.isAdmin,
                    isBanned: newUser.isBanned,
                    isVerified: newUser.isVerified
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = handleBasicRegister;
