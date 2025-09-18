const { validationResult } = require('express-validator');
const categoryService = require('../services/categoryService');
const postService = require('../services/postService');
const errorForApi = require('../utils/errorForApi');

const handleValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw errorForApi.BadRequestError('Validation error', errors.array());
  }
};

// CREATE
const createCategory = async (req, res, next) => {
  try {
    handleValidation(req);
    const { title, description } = req.body;
    const category = await categoryService.createCategory(title, description);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

// READ ALL
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};

// READ ONE
const getCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.category_id;
    const category = await categoryService.getCategory(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
};

// UPDATE
const updateCategory = async (req, res, next) => {
  try {
    handleValidation(req);
    const categoryId = req.params.category_id;
    const { title, description } = req.body;
    const category = await categoryService.updateCategory(categoryId, title, description);
    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
};

// DELETE
const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.category_id;
    await categoryService.deleteCategory(categoryId);
    res.status(204).json({ message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// GET POSTS BY CATEGORY
const getPostsByCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.category_id;

    const posts = await postService.getPostsByCategory(
      categoryId,
      req.user?.id,
      req.user?.role ?? 'user'
    );

    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getPostsByCategory,
};
