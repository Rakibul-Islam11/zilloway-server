const express = require("express");
const { handleGetJobb, handleJobPost, handleGetAllJobPosts } = require("../controllers/jobPostController");


const jobRouter = express.Router();

// Add middleware to ensure JSON parsing
jobRouter.use(express.json());

jobRouter.post('/post-job', handleJobPost);
jobRouter.get('/get-all-job-post', handleGetAllJobPosts); 
jobRouter.get('/get-job/:id', handleGetJobb);

module.exports = jobRouter;