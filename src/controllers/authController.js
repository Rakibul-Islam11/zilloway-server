const createError = require('http-errors');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const {successResponse} = require('./responseController');
const { createJSONWebToken } = require('../helper/jsonwebtoken');
const bcrypt = require('bcryptjs');
const { jwtAccessKey, jwtRefreshKey } = require('../secretCredential');


const handleLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 🔍 Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            throw createError(404, 'User does not exist. Please register first.');
        }

        // 🔐 Compare password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw createError(401, 'Email or password is incorrect.');
        }

        // 🚫 Check if banned
        if (user.isBanned) {
            throw createError(403, 'You are banned. Please contact support.');
        }

        // 🧠 Create Tokens
        const accessToken = createJSONWebToken({ user }, jwtAccessKey, '1d');
        const refreshToken = createJSONWebToken({ user }, jwtRefreshKey, '7d');

        // ⚙️ Cookie options depending on environment
        const isProduction = process.env.NODE_ENV === 'production';

        const cookieOptions = {
            httpOnly: true,
            secure: isProduction, // ✅ HTTPS হলে true
            sameSite: isProduction ? 'none' : 'lax', // ✅ localhost এ "lax"
        };

        // 🍪 Set cookies
        res.cookie('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000, // ✅ 1 day (24 hours)
        });


        res.cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // 🔒 Remove password before sending user info
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        // ✅ Success Response
        return successResponse(res, {
            statusCode: 200,
            message: 'User logged in successfully',
            payload: { user: userWithoutPassword },
        });
    } catch (error) {
        next(error);
    }
};
const handleLogout = async (req, res, next) => {
    try {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        // success response
        return successResponse(res, {
            statusCode: 200,
            message: 'user loggedout successfully',
            payload: {},
        });
    
    } catch (error) {
        next(error);
    }
};
const handleRefreshToken = async (req, res, next) => {
    try {
        
        const oldRefreshToken = req.cookies.refreshToken;

        // verify the old refresh token
        const decodedToken = jwt.verify(oldRefreshToken, jwtRefreshKey);

        if (!decodedToken) {
            throw createError(401, 'Invalid refresh token. Please login again');
        }

        // token, cookie
        const accessToken = createJSONWebToken(
            decodedToken.user,
            jwtAccessKey,
            '5m'
        );
        res.cookie('accessToken', accessToken, {
            maxAge: 5 * 60 * 1000, 
            httpOnly: true,
            // secure: true,
            sameSite: 'none',
        });



        return successResponse(res, {
            statusCode: 200,
            message: 'new access token is genereted',
            payload: {},
        });
    
    } catch (error) {
        next(error);
    }
};
const handleProtectedRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            throw createError(401, 'Access token not found, Please Log In');
        }

        // token verify
        const decodedToken = jwt.verify(accessToken, jwtAccessKey);
        if (!decodedToken) {
            throw createError(401, 'Invalid access token. Please login again');
        }

        // ✅ attach user to payload
        const user = decodedToken.user;

        return successResponse(res, {
            statusCode: 200,
            message: 'protected recourcess accesses successfully',
            payload: { user }, // <-- এখানে user attach করা হলো
        });

    } catch (error) {
        next(error);
    }
};

const handleProfile = (req, res, next) => {
    try {
        const user = { ...req.user };
        delete user.password; // password hide

        return successResponse(res, {
            statusCode: 200,
            message: "Current logged-in user",
            payload: { user },
        });
    } catch (error) {
        next(error);
    }
};
module.exports = {
    handleLogin,
    handleLogout,
    handleRefreshToken,
    handleProtectedRoute,
    handleProfile
};