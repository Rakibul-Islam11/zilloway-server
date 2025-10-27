const { body } = require('express-validator');

// Registration validation
const validateCategory = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('category Name is required')
        .isLength({ min: 3 })
        .withMessage('Name should be at least 3 characters long'),
    
    
];


module.exports = { validateCategory };
