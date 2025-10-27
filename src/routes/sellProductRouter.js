const express = require("express");
const multer = require("multer");
const { handlePostSellProduct, handleGetSellProduct, handleGetSellProductSlider, handleGetAllSellProduct, handleGetSellProductForDetails } = require("../controllers/sellProductController");


const storage = multer.memoryStorage();
const upload = multer({ storage });

const sellProductRouter = express.Router();

// multiple files
sellProductRouter.post("/post-sell-product", upload.array("images"), handlePostSellProduct);

sellProductRouter.get("/get-all-sell-products-slider", handleGetSellProductSlider);

sellProductRouter.get("/get-all-sell-products", handleGetAllSellProduct);

sellProductRouter.get("/get-sell-product/:id", handleGetSellProductForDetails);

module.exports = sellProductRouter;
