const multer = require("multer");
const path = require("path");

// storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/users"); // local folder where files will be stored
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

// file type filter (optional)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only .jpg, .jpeg, and .png files are allowed!"), false);
    }
};

const upload = multer({ storage, fileFilter });
