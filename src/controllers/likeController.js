const likeService = require('../services/likeService');

class LikeController {
  async togglePost(req, res, next) {
    try {
      const { type } = req.body; // 'like' | 'dislike'
      const result = await likeService.toggle(req.user.id, 'post', req.params.postId, type);
      res.json(result);
    } catch (e) { next(e); }
  }
  async toggleComment(req, res, next) {
    try {
      const { type } = req.body;
      const result = await likeService.toggle(req.user.id, 'comment', req.params.commentId, type);
      res.json(result);
    } catch (e) { next(e); }
  }
}
module.exports = new LikeController();
