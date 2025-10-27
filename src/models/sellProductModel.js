const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const sellProductSchema = new Schema(
    {
        category: {
            type: String,
            enum: ["electronics", "non-electronics"],
            required: true,
        },
        condition: {
            type: String,
            enum: ["new", "used"],
            default: "new",
        },
        productName: { type: String, required: true },
        brand: { type: String }, // Only for electronics
        price: { type: Number, required: true },
        negotiable: { type: Boolean, default: false },

        phoneNumber: { type: String },
        hideNumber: { type: Boolean, default: false },

        description: { type: String },

        // 📍 New Location Field
        location: {
            address: { type: String, required: true }, // user input address
            lat: { type: Number }, // optional: latitude
            lng: { type: Number }, // optional: longitude
        },

        // 🖼️ Images array
        images: [
            {
                url: { type: String, required: true },
                isPrimary: { type: Boolean, default: false },
            },
        ],

        // ⚙️ Default / system fields
        listedBy: { type: String, default: "Admin" },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        ban: { type: Boolean, default: false },
        status: { type: String, default: "approved" },
        trending: { type: Boolean, default: false },
    },
    {
        timestamps: true, // createdAt & updatedAt
    }
);

const SellProduct = model("SellProduct", sellProductSchema);
module.exports = SellProduct;
