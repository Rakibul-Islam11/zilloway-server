
const createError = require('http-errors');
const JobPost = require('../models/manageJobModel');
const mongoose = require('mongoose');

const handleJobPost = async (req, res, next) => {
    try {
        console.log('✅ Job post request received');
        console.log('📝 Request body:', req.body);

        // Get data from request body
        const {
            jobTitle,
            jobDescription,
            jobRequirements,
            minSalary,
            maxSalary,
            currency = "USD"
        } = req.body;

        // Get user ID from authenticated user
        const userId = req.user?.id;
        console.log('👤 User ID:', userId);

        // Basic validation
        if (!jobTitle || !jobDescription || !jobRequirements || !minSalary || !maxSalary) {
            console.log('❌ Validation failed: Missing fields');
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate salary range
        if (parseInt(minSalary) > parseInt(maxSalary)) {
            return res.status(400).json({
                success: false,
                message: "Maximum salary must be greater than minimum salary"
            });
        }

        // Convert jobRequirements to array
        let requirementsArray;
        if (typeof jobRequirements === 'string') {
            requirementsArray = jobRequirements
                .split('\n')
                .filter(req => req.trim() !== '')
                .map(req => req.trim());
        } else {
            requirementsArray = jobRequirements;
        }

        // Create job post

        const newJobPost = new JobPost({
            jobTitle: jobTitle.trim(),
            jobDescription: jobDescription.trim(),
            jobRequirements: requirementsArray,
            salaryRange: {
                min: parseInt(minSalary),
                max: parseInt(maxSalary),
                currency: currency
            },
            userId: userId,
            status: "approved"
        });

        console.log('💾 Saving to database...');
        const savedJobPost = await newJobPost.save();
        console.log('✅ Job saved successfully:', savedJobPost._id);

        // Success response
        return res.status(201).json({
            success: true,
            message: "Job posted successfully",
            data: savedJobPost
        });

    } catch (error) {
        console.error('❌ Controller error:', error);

        // Ensure JSON response even for errors
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};


const handleGetAllJobPosts = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10; // এখানে 10 ensure করুন

        console.log('📊 Pagination params:', { page, limit, search }); // Debugging

        const searchRegExp = new RegExp(search, "i");

        const filter = {
            $or: [
                { jobTitle: { $regex: searchRegExp } },
                { jobDescription: { $regex: searchRegExp } },
                { "salaryRange.currency": { $regex: searchRegExp } },
            ],
            status: "approved"
        };

        const skip = (page - 1) * limit;
        console.log('📝 MongoDB query:', { filter, skip, limit }); // Debugging

        const users = await JobPost.find(filter)
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        const count = await JobPost.countDocuments(filter);

        console.log('✅ Results:', {
            found: users.length,
            total: count,
            totalPages: Math.ceil(count / limit)
        }); // Debugging

        res.json({
            users,
            pagination: {
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                previousPage: page > 1 ? page - 1 : null,
                nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
            },
        });
    } catch (error) {
        console.error('❌ Error in handleGetAllJobPosts:', error);
        next(error);
    }
};

const handleGetJobb = async (req, res, next) => {
    try {
        const { id } = req.params;

        console.log('🔍 Fetching job with ID:', id);

        // Check if ID is valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid job ID format"
            });
        }

        // Find job by ID
        const job = await JobPost.findById(id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job post not found"
            });
        }

        console.log('✅ Job found:', job._id);

        // Success response
        return res.status(200).json({
            success: true,
            message: "Job retrieved successfully",
            data: job
        });

    } catch (error) {
        console.error('❌ Error in handleGetJobb:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    handleJobPost,
    handleGetAllJobPosts,
    handleGetJobb
};