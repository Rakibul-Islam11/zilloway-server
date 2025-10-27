
const { successResponse } = require("../controllers/responseController");
const User = require("../models/userModel");

const handlePropertyUserInfoUpdate = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { name, phone, professionalType } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                name,
                phone,
                professionalType,
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return successResponse(res, {
            statusCode: 200,
            message: "User info updated successfully",
            payload: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = handlePropertyUserInfoUpdate;
