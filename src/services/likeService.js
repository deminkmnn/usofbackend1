const db = require('../config/db');

class LikeService {
  // toggle лайк для будь-якого типу (post/comment)
  async toggle(author_id, target_type, target_id, type) {
    const [rows] = await db.execute(
      'SELECT * FROM Likes WHERE author_id=? AND target_type=? AND target_id=?',
      [author_id, target_type, target_id]
    );
    const existing = rows[0];

    if (!existing) {
      await db.execute(
        'INSERT INTO Likes (author_id, target_type, target_id, type) VALUES (?,?,?,?)',
        [author_id, target_type, target_id, type]
      );
      return { action: 'added', type };
    }
    if (existing.type === type) {
      await db.execute('DELETE FROM Likes WHERE id=?', [existing.id]);
      return { action: 'removed', type };
    }
    await db.execute('UPDATE Likes SET type=? WHERE id=?', [type, existing.id]);
    return { action: 'switched', type };
  }

  // ============================
  // Методи для коментарів
  // ============================
  async createCommentLike(commentId, authorId, type) {
    return this.toggle(authorId, 'comment', commentId, type);
  }

  async getCommentLikes(commentId, type = null, userId = null) {
    let query = 'SELECT * FROM Likes WHERE target_type="comment" AND target_id=?';
    const params = [commentId];

    if (type) {
      query += ' AND type=?';
      params.push(type);
    }
    if (userId) {
      query += ' AND author_id=?';
      params.push(userId);
    }

    const [rows] = await db.execute(query, params);
    return rows;
  }

  async deleteCommentLike(authorId, commentId) {
    console.log("deleteCommentLike params:", { authorId, commentId });

    if (!authorId || !commentId) {
      throw new Error("authorId or commentId is undefined!");
    }

    const [rows] = await db.execute(
      'SELECT * FROM Likes WHERE Author_Id=? AND Target_Type="comment" AND Target_Id=?',
      [authorId, commentId]
    );

    if (!rows[0]) return { action: 'none' };

    await db.execute('DELETE FROM Likes WHERE Id=?', [rows[0].Id]);
    return { action: 'removed' };
  }


  // існуючі методи для постів залишаються
  async createPostLikes(postId, authorId, type) {
    return this.toggle(authorId, 'post', postId, type);
  }

  async getPostLikes(postId, type = null, userId = null) {
    let query = 'SELECT * FROM Likes WHERE target_type="post" AND target_id=?';
    const params = [postId];

    if (type) params.push(type);
    if (userId) params.push(userId);

    const [rows] = await db.execute(query, params);
    return rows;
  }

  async deletePostLike(authorId, postId) {
    const [rows] = await db.execute(
      'SELECT * FROM Likes WHERE author_id=? AND target_type="post" AND target_id=?',
      [authorId, postId]
    );
    if (!rows[0]) return { action: 'none' };
    await db.execute('DELETE FROM Likes WHERE id=?', [rows[0].id]);
    return { action: 'removed' };
  }
}

module.exports = new LikeService();
