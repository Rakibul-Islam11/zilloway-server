const { Schema, model } = require("mongoose");


const categorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true,
        minlength: [3, "Category name length can be min 31 character"],
        
    },
    slug: {
        type: String,
        required: [true, 'Category slug name is required'],
        Lowercase: true,
        unique: true,
        
        
    },
    
},{timestamps:true});

const Category = model('Category', categorySchema);
module.exports = Category;