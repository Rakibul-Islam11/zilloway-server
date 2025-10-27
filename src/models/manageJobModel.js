const { Schema, model } = require("mongoose");

const jobPostSchema = new Schema(
    {
        jobTitle: {
            type: String,
            required: true,
            trim: true,
        },
        jobDescription: {
            type: String,
            required: true,
        },
        jobRequirements: {
            type: [String], // multiple requirement list রাখার জন্য
            required: true,
        },
        salaryRange: {
            min: { type: Number, required: true },
            max: { type: Number, required: true },
            currency: { type: String, default: "USD" }, // ঐচ্ছিক
        },

        // পোস্টকারী ব্যবহারকারীর তথ্য
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },

        // পোস্টের অবস্থা
        ban: { type: Boolean, default: false },
        status: { type: String, default: "approved" },
        treanding: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const JobPost = model("JobPost", jobPostSchema);
module.exports = JobPost;
