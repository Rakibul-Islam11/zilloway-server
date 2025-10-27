require('dotenv').config()
const serverPort = process.env.SERVER_PORT || 3002;
const mongodbURL = process.env.MONGODB_ATLAS_URL || 'mongodb://localhost:27017/ecommerceMernDB';

const jwtActivationKey = process.env.JWT_ACTIVATION_KEY || "shiulghuih7843hjb";
const jwtAccessKey = process.env.JWT_ACCESS_KEY || 'ahahihaiaghaigag_28y2266283';
const jwtRefreshKey = process.env.JWT_REFRESH_KEY || 'ahahihaiaghaigag_28y2266283';
const jwtResetPasswordKey = process.env.JWT_RESET_PASSWORD_KEY || 'ahahihaiaghaigag_28y2266283';
const smtpUsername = process.env.SMTP_USERNAME || "";
const smtpPassword = process.env.SMTP_PASSWORD || "";
const clientUrl = process.env.CLIENT_URL || "";
const jwtResetKey = process.env.JWT_RESET_KEY;
const defaultImagePath =
    process.env.DEFAULT_USER_IMAGE_PATH || 'public/images/users/default.png';

const uploadDir = process.env.UPLOAD_FILE || 'public/images/users';
module.exports = {
    serverPort, mongodbURL, jwtActivationKey, smtpUsername, smtpPassword, clientUrl, jwtAccessKey, jwtRefreshKey, jwtResetPasswordKey, defaultImagePath, uploadDir, jwtResetKey
}