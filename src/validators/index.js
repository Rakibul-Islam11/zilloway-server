const { validationResult } = require("express-validator");
const { errorResponse } = require("../controllers/responseController");

const runValidation = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {

            if (!errors.isEmpty()) {
                return errorResponse(res, {
                    statusCode: 422,
                    message: errors.array()[0].msg,
                });

            }

            return next();


        }

       return next(); // continue if no validation errors
    } catch (error) {
        return next(error);
    }
};

module.exports = { runValidation };
