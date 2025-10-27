// const { Schema, model } = require("mongoose");
// const bcrypt = require("bcryptjs");
// const { defaultImagePath } = require("../secretCredential");


// const basicUserSchema = new Schema({
    
//     email: {
//         type: String,
//         required: [true, 'User name is required'],
//         trim: true,
//         unique: true,
//         lowercase: true,
//         validate: {
//             validator: function (v) {
//                 return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v);
//             },
//             message: 'Please enter a valid email'
//         }
//     },
//     password: {
//         type: String,
//         required: [true, 'User name is required'],
//         trim: true,
//         minlength: [6, "User name length can be min 6 character"],
//         set: (v) => bcrypt.hashSync(v, bcrypt.genSaltSync(10))
//     },
    
//     isAdmin: {
//         type: Boolean,
//         default: false,
//     },
//     isVerified: {
//         type: Boolean,
//         default: false, // unverified user by default
//     },
//     image: {
//         type: String,
//         default:
//             defaultImagePath,
//     },
//     isBanned: {
//         type: Boolean,
//         default: false,
//     },
// },{timestamps:true});

// const User = model('Users', basicUserSchema);
// module.exports = User;