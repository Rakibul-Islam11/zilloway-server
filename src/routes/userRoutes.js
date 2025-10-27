const express = require("express");
const { handleManageUserStatusById, handleDeleteUserById, handleUpdateUserById, handleUpdatePassword, handleForgetPassword, handleResetPassword, handleProcessRegister, handleActivteUserAccount, handleGetUserById, handleGetUsers, handleResendVerificationEmail } = require("../controllers/userController");

const { runValidation } = require("../validators");
const {  validateUserPasswordUpdate, validateUserForgetPassword, validateUserResetPassword, validateUserRegistration } = require("../validators/auth");
const { isLoggedIn, isLoggedOut, isAdmin } = require("../middlewares/auth");
const upload = require("../middlewares/uploadFile");
const handleBasicRegister = require("../controllers/basicRegController");


const userRouter = express.Router()

userRouter.post("/process-register", validateUserRegistration, runValidation, handleProcessRegister);

userRouter.post('/activate', isLoggedOut, handleActivteUserAccount)
userRouter.get('/get-user', handleGetUsers)
userRouter.get('/:id', isLoggedIn, handleGetUserById)
userRouter.delete('/:id', isLoggedIn, handleDeleteUserById)
userRouter.put(
    '/reset-password',
    validateUserResetPassword,
    runValidation,
    handleResetPassword
);
userRouter.put('/:id', upload.single("image"), isLoggedIn, handleUpdateUserById) // form data নিয়ে কাজ করার জন্য upload.none() দিতে হয়েছে
userRouter.put('/manage-user/:id',  isLoggedIn, isAdmin, handleManageUserStatusById);
// userRoute.put('/unban-user/:id', isLoggedIn, isAdmin, handleUnbanUserById);
userRouter.put('/forget-password/:id', validateUserPasswordUpdate, runValidation, isLoggedOut, handleUpdatePassword);
userRouter.post('/update-password', validateUserForgetPassword, runValidation, handleForgetPassword);

userRouter.post('/basic-register',  isLoggedOut, handleBasicRegister)

userRouter.post('/resend-verification', isLoggedOut, handleResendVerificationEmail);


module.exports = userRouter;