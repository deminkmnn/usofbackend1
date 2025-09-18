const router = require('express').Router();
const post = require('../controllers/postController');
const auth = require('../middleware/authMiddleware');

// -------------------- ПУБЛІЧНІ --------------------
// GET /api/posts - всі пости з пагінацією
router.get('/', post.listPosts);

// GET /api/posts/:post_id - конкретний пост
router.get('/:post_id', post.getPost);

// GET /api/posts/:post_id/comments - всі коментарі поста
router.get('/:post_id/comments', post.getComments);

// GET /api/posts/:post_id/categories - категорії поста
router.get('/:post_id/categories', post.getCategories);

// GET /api/posts/:post_id/like - всі лайки поста
router.get('/:post_id/like', post.getLikes);

// -------------------- АВТОРИЗОВАНІ --------------------
// POST /api/posts/ - створення поста
router.post('/', auth(), post.createPost);

// PATCH /api/posts/:post_id - оновлення поста (тільки автор або адмін)
router.patch('/:post_id', auth(), post.updatePost);

// DELETE /api/posts/:post_id - видалення поста (тільки автор або адмін)
router.delete('/:post_id', auth(), post.deletePost);

// POST /api/posts/:post_id/comments - створення коментаря
router.post('/:post_id/comments', auth(), post.createComment);

// POST /api/posts/:post_id/like - створення лайка
router.post('/:post_id/like', auth(), post.createLike);

// DELETE /api/posts/:post_id/like - видалення лайка
router.delete('/:post_id/like', auth(), post.deleteLike);

// -------------------- АДМІН --------------------
// PATCH /api/posts/:post_id/status - змінити статус поста
router.patch('/:post_id/status', auth('admin'), post.setStatus);

module.exports = router;
