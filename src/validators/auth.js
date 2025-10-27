const { body } = require('express-validator');

// Registration validation
const validateUserRegistration = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 3, max: 31 })
        .withMessage('Name should be at least 3–31 characters long'),
    
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address'),
    
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password should be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .withMessage(
            'Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        )

    
];
const validateUserLogin = [
    
    
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address'),
    
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password should be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .withMessage(
            'Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        )

    
];
const validateUserPasswordUpdate = [
    body('oldPassword')
        .trim()
        .notEmpty()
        .withMessage('Old Password is required')
        .isLength({ min: 6 })
        .withMessage('Old Password should be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .withMessage(
            'Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        ),

    body('newPassword')
        .trim()
        .notEmpty()
        .withMessage('New Password is required')
        .isLength({ min: 6 })
        .withMessage('New Password should be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .withMessage(
            'Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        ),
    //!এখানে new pass and confirm pass front end থেকে validate করতে হবে এখান নই
    // body('confirmedPassword').custom((value, { req }) => {
    //     if (value !== req.body.newPassword) {
    //         throw new Error('Password did not match');
    //     }
    //     return true;
    // }),
];
const validateUserForgetPassword = [


    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address'),

];
const validateUserResetPassword = [
    body('token').trim().notEmpty().withMessage('Token is missing.'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is missing')
        ,
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password should be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .withMessage(
            'Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        )
];

module.exports = { validateUserRegistration, validateUserLogin, validateUserPasswordUpdate, validateUserForgetPassword, validateUserResetPassword };
