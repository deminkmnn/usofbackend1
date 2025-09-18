const { validationResult } = require('express-validator');
const commentService = require('../services/commentService');
const likeService = require('../services/likeService');
const errorForApi = require('../utils/errorForApi');

// Helper to handle validation errors
const handleValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw errorForApi.BadRequestError('Validation error', errors.array());
  }
};

// COMMENT HANDLERS
const getComment = async (req, res, next) => {
  try {
    const commentId = Number(req.params.comment_id);
    const comment = await commentService.getComment(req.user.role, commentId, req.user.id);
    res.status(200).json(comment);
  } catch (err) {
    next(err);
  }
};


const updateComment = async (req, res, next) => {
  try {
    handleValidation(req);

    const commentId = req.params.comment_id;
    const { content, status } = req.body;
    const comment = await commentService.updateComment(req.user.role, commentId, req.user.id, status, content);

    res.status(200).json(comment);
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const commentId = Number(req.params.comment_id);
    await commentService.delete(commentId, { id: req.user.id, role: req.user.role });

    res.status(204).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    next(err);
  }
};


// LIKE HANDLERS
const createCommentLike = async (req, res, next) => {
  try {
    handleValidation(req);

    const commentId = req.params.comment_id;
    const { type } = req.body;
    const like = await likeService.createCommentLike(commentId, req.user.id, type);

    res.status(201).json(like);
  } catch (err) {
    next(err);
  }
};

const getCommentLikes = async (req, res, next) => {
  try {
    const commentId = req.params.comment_id;
    const { type } = req.query;
    const likes = await likeService.getCommentLikes(commentId, type, req.user.id);

    res.status(200).json(likes);
  } catch (err) {
    next(err);
  }
};

const deleteCommentLike = async (req, res, next) => {
  try {
    const commentId = Number(req.params.comment_id);
    const authorId = Number(req.user.id);

    if (!authorId || !commentId) {
      throw new Error('authorId or commentId is invalid!');
    }

    const result = await likeService.deleteCommentLike(authorId, commentId);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};


module.exports = {
  getComment,
  updateComment,
  deleteComment,
  createCommentLike,
  getCommentLikes,
  deleteCommentLike,
};
