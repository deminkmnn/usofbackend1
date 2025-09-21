const router = require('express').Router();
const comment = require('../controllers/commentController');
const auth = require('../middleware/authMiddleware');

router.get('/:comment_id', auth(), comment.getComment);
router.patch('/:comment_id', auth(), comment.updateComment);
router.delete('/:comment_id', auth(), comment.deleteComment);

router.get('/:comment_id/like', auth(), comment.getCommentLikes);
router.post('/:comment_id/like', auth(), comment.createCommentLike);
router.delete('/:comment_id/like', auth(), comment.deleteCommentLike);

module.exports = router;
