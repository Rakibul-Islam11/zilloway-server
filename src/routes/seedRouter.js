const express = require('express');
const seedRouter = express.Router();
const { seedUser, seedProduts } = require('../controllers/seedController');


seedRouter.get('/users', seedUser)
seedRouter.get('/products', seedProduts)

module.exports = seedRouter;