const createError = require('http-errors');
const emailWithNodeMailer = require('./email');

const sendEmail = async (emailData) => {
    //send email with nodemailer
    try {
        await emailWithNodeMailer(emailData);
    } catch (emailError) {
        throw createError(500, 'Failed to send verification email');
        return;
    }
}

module.exports = sendEmail;

