const { Schema, model } = require("mongoose");

const rentPostSchema = new Schema({
    state: {
        propertyType: { type: String, required: true },
        streetAddress: { type: String, required: true },
        unitNumber: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
    },
    squareFootage: { type: String },
    bedrooms: { type: String },
    bathrooms: { type: String },
    description: { type: String },

    monthlyRent: { type: String },
    leaseTerms: { type: String },
    securityDeposit: { type: String },
    insuranceRequirement: { type: String },

    offerStartDate: { type: Date },
    offerEndDate: { type: Date },
    offerDescription: { type: String },

    contactName: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    showPhoneOnPost: { type: Boolean, default: true },

    petsAllowed: { type: String },
    petPolicyNegotiable: { type: Boolean, default: false },
    cooling: [{ type: String }],
    heating: [{ type: String }],
    flooring: [{ type: String }],
    laundry: { type: String },

    photos: [
        {
            url: { type: String },
            caption: { type: String },
            isPrimary: { type: Boolean, default: false } // ✅ নতুন field যোগ করা হলো
        }
    ],

    fees: [
        {
            feeName: { type: String },
            category: { type: String },
            amount: { type: String },
            frequency: { type: String },
        }
    ],

    costsFees: [
        {
            feeName: { type: String },
            category: { type: String },
            amount: { type: String },
            frequency: { type: String },
        }
    ],

    listedBy: { type: String },

    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ban: { type: Boolean, default: false },
    status: { type: String, default: "approved" },
    treanding: { type: Boolean, default: false },

}, { timestamps: true });

const RentPost = model('RentPost', rentPostSchema);
module.exports = RentPost;