const router = require('express').Router();
const like = require('../controllers/likeController');
const auth = require('../middleware/authMiddleware');

router.post('/post/:postId', auth(), (req, res, next) => like.togglePost(req, res, next));
router.post('/comment/:commentId', auth(), (req, res, next) => like.toggleComment(req, res, next));

module.exports = router;
