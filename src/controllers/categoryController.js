
const { successResponse } = require("./responseController");
const createError = require('http-errors')
const { createCategory, getCategories, getCategory, updateCategory, deleteCategory } = require('../services/categoryService');

const handleCreateCategory = async (req, res, next) => {
    try {
        
        const { name } = req.body;
        const newCategory = await createCategory(name);
        return successResponse(res, {
            statusCode: 201,
            message: `Category '${name}' was created`,
            payload: newCategory
        });
    } catch (error) {
        next(error);
    }
};
const handleGetCategories = async (req, res, next) => {
    try {
        const categories = await getCategories();
        return successResponse(res, {
            statusCode: 200,
            message: 'categories fetched successfully',
            payload: categories,
        });
    } catch (error) {
        next(error);
    }
};
const handleGetCategory = async (req, res, next) => {
    try {
        const {slug} = req.params
        const category = await getCategory(slug);
        if (!category) {
            throw createError(404, 'Category not found');
        }
        return successResponse(res, {
            statusCode: 200,
            message: 'categories fetched successfully',
            payload: category,
        });
    } catch (error) {
        next(error);
    }
};
const handleUpdateCategory = async (req, res, next) => {
    try {
        const { name } = req.body;
        const { slug } = req.params;

        const updatedCategory = await updateCategory(name, slug);
        if (!updatedCategory) {
            throw createError(404, 'Category not found');
        }

        return successResponse(res, {
            statusCode: 200,
            message: 'category updated successfully', 
            payload: updatedCategory,
        });
    } catch (error) {
        next(error);
    }
};

const handleDeleteCategory = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const result = await deleteCategory(slug);

        if (!result) {
            throw createError(404, 'Category not found');
        }

        return successResponse(res, {
            statusCode: 200,
            message: 'category deleted successfully', 

        });
    } catch (error) {
        next(error);
    }
};

module.exports = { handleCreateCategory, handleGetCategories, handleGetCategory, handleUpdateCategory, handleDeleteCategory };
