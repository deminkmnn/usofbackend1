const router = require('express').Router();
const category = require('../controllers/categoryController');
const auth = require('../middleware/authMiddleware');

// PUBLIC
router.get('/', category.getAllCategories);
router.get('/:category_id', category.getCategory);
router.get('/:category_id/posts', category.getPostsByCategory);

// ADMIN ONLY
router.post('/', auth('admin'), category.createCategory);
router.patch('/:category_id', auth('admin'), category.updateCategory);
router.delete('/:category_id', auth('admin'), category.deleteCategory);

module.exports = router;
