const express = require("express");
const { handleCreateProduct, handleGetProducts, handleGetProduct, handleDeleteProduct, handleUpdateProduct } = require("../controllers/productController");
const { validateProduct } = require("../validators/product");
const { runValidation } = require("../validators");
const { isLoggedIn, isAdmin } = require("../middlewares/auth");
const upload = require("../middlewares/uploadFile");



const productRouter = express.Router()


productRouter.post('/', upload.single("image"), validateProduct, runValidation, isLoggedIn, isAdmin,handleCreateProduct);

// GET -> /api/products -> get all products
productRouter.get(
    '/',
    handleGetProducts
);
// GET -> /api/products/:slug -> get single product
productRouter.get('/:slug', handleGetProduct);

// DELETE -> /api/products/:slug -> delete single product
productRouter.delete('/:slug', isLoggedIn, isAdmin, handleDeleteProduct);

// PUT -> /api/products/:slug -> update a single product
productRouter.put('/:slug', upload.single("image"), isLoggedIn, isAdmin, handleUpdateProduct);

module.exports = productRouter;
