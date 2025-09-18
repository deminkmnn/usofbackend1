const { validationResult } = require('express-validator');
const postService = require('../services/postService');
const commentService = require('../services/commentService');
const likeService = require('../services/likeService');
const errorForApi = require('../utils/errorForApi');

// Helper для обробки помилок валідації
const handleValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw errorForApi.BadRequestError('Validation error', errors.array());
  }
};

// -------------------- POSTS --------------------

// GET /api/posts
const listPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // можна змінити розмір сторінки
    const posts = await postService.listPublic(page, pageSize);
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:post_id
const getPost = async (req, res, next) => {
  try {
    const post = await postService.get(req.params.post_id, req.user);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/
const createPost = async (req, res, next) => {
  try {
    handleValidation(req);
    const { title, content, categories } = req.body;
    const post = await postService.create(req.user.id, { title, content, categories });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/posts/:post_id
const updatePost = async (req, res, next) => {
  try {
    handleValidation(req);
    const { title, content, categories } = req.body;
    const post = await postService.update(req.params.post_id, req.user, { title, content, categories });
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:post_id
const deletePost = async (req, res, next) => {
  try {
    await postService.remove(req.params.post_id, req.user);
    res.status(204).json({ message: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/posts/:post_id/status (для адміна)
const setStatus = async (req, res, next) => {
  try {
    const post = await postService.setStatus(req.params.post_id, req.body.status);
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
};

// -------------------- COMMENTS --------------------

// GET /api/posts/:post_id/comments
const getComments = async (req, res, next) => {
  try {
    const postId = req.params.post_id; // правильне написання
    const comments = await commentService.listByPost(postId);
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};


// POST /api/posts/:post_id/comments
const createComment = async (req, res, next) => {
  try {
    handleValidation(req);
    const { content } = req.body;
    const comment = await commentService.create(req.params.post_id, req.user.id, content);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

// -------------------- CATEGORIES --------------------

// GET /api/posts/:post_id/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await postService.getPostCategories(req.params.post_id);
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};

// -------------------- LIKES --------------------

// GET /api/posts/:post_id/like
const getLikes = async (req, res, next) => {
  try {
    const likes = await likeService.getPostLikes(req.params.post_id, req.query.type, req.user?.id);
    res.status(200).json(likes);
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:post_id/like
const createLike = async (req, res, next) => {
  try {
    handleValidation(req);
    const { type } = req.body;
    const like = await likeService.createPostLike(req.params.post_id, req.user.id, type);
    res.status(201).json(like);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:post_id/like
const deleteLike = async (req, res, next) => {
  try {
    console.log('req.user:', req.user);
    console.log('req.params:', req.params);

    const result = await likeService.deletePostLike(req.user?.id, req.params.post_id);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  setStatus,
  getComments,
  createComment,
  getCategories,
  getLikes,
  createLike,
  deleteLike,
};
