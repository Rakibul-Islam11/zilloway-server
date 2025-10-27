const express = require("express");
const multer = require("multer");
const { isLoggedIn } = require("../middlewares/auth");
const { handleHouseRentImgaePost, handleHouseRentPost, handleGetHouseRentPost, handleGetHouseRentPostById } = require("../controllers/housePostController");

const router = express.Router();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload single image
router.post('/upload-image', isLoggedIn, upload.single('image'), handleHouseRentImgaePost);

// Publish post
router.post('/publish-post', isLoggedIn, handleHouseRentPost);

// get ent post
router.get('/rent-post', handleGetHouseRentPost);
// get single rent post by ID
router.get('/rent-post/:id', handleGetHouseRentPostById);

module.exports = router;
