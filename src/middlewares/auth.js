const createError = require('http-errors');
const { jwtAccessKey } = require("../secretCredential");
const jwt = require('jsonwebtoken');

const isLoggedIn = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            throw createError(401, 'Access token not found, Please Log In');
        }

        let decoded;
        try {
            decoded = jwt.verify(accessToken, jwtAccessKey);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return next(createError(401, 'Access token has expired, please log in again'));
            }
            if (error.name === 'JsonWebTokenError') {
                return next(createError(401, 'Invalid access token, please log in again'));
            }
            return next(createError(500, 'Token verification failed'));
        }

        req.user = decoded.user;
        next();
    } catch (error) {
        return next(error);
    }
};

const isLoggedOut = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (accessToken) {
            try {
                const decoded = jwt.verify(accessToken, jwtAccessKey);
                if (decoded) {
                    throw createError(400, 'User is already logged in');
                }
            } catch (error) {
                if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
                    // Token invalid হলে ignore করে দাও (user effectively logged out)
                    return next();
                }
                return next(error);
            }
        }
        next();
    } catch (error) {
        return next(error);
    }
};

const isAdmin = async (req, res, next) => {
    try {
        console.log(req.user.isAdmin); // ইউজারের অ্যাডমিন স্ট্যাটাস দেখার জন্য লগ

        if (!req.user.isAdmin) {
            throw createError(403, 'Forbidden. You must be an admin');
        }
        next();
        
    } catch (error) {
        return next(error);
    }
};


module.exports = {
    isLoggedIn,
    isLoggedOut,
    isAdmin
};