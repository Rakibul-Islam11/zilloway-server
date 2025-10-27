const express = require("express");
const handlePropertyUserInfoUpdate = require("../controllers/handlePropertyUserInfoUpdate");
const propertyRouter = express.Router()


// POST -> /api/property/:id -> get single product
propertyRouter.post('/:id', handlePropertyUserInfoUpdate);
propertyRouter.post('/:id', handlePropertyUserInfoUpdate);




module.exports = propertyRouter;
