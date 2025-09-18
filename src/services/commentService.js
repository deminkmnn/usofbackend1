const db = require('../config/db');

class CommentService {
  async listByPost(post_id) {
      const [rows] = await db.execute(
          `SELECT c.*, u.login AS author_login
          FROM Comments c 
          JOIN Users u ON u.id=c.author_id
          WHERE c.post_id=? AND c.status='active'
          ORDER BY c.publish_date ASC`,
          [post_id]
      );
      return rows;
  }

  async create(post_id, author_id, content) {
    const [res] = await db.execute(
      'INSERT INTO Comments (post_id, author_id, content) VALUES (?,?,?)',
      [post_id, author_id, content]
    );
    const [rows] = await db.execute('SELECT * FROM Comments WHERE id=?', [res.insertId]);
    return rows[0];
  }

  async update(id, actor, content) {
    const [rows] = await db.execute('SELECT * FROM Comments WHERE id=?', [id]);
    const c = rows[0];
    if (!c) { const e = new Error('Comment not found'); e.status = 404; throw e; }
    if (actor.role !== 'admin' && actor.id !== c.author_id) {
      const e = new Error('Forbidden'); e.status = 403; throw e;
    }
    await db.execute('UPDATE Comments SET content=? WHERE id=?', [content, id]);
    const [back] = await db.execute('SELECT * FROM Comments WHERE id=?', [id]);
    return back[0];
  }

  async setStatus(id, status) {
    await db.execute('UPDATE Comments SET status=? WHERE id=?', [status, id]);
    const [rows] = await db.execute('SELECT * FROM Comments WHERE id=?', [id]);
    return rows[0] || null;
  }

  async delete(id, actor) {
      const [rows] = await db.execute('SELECT * FROM Comments WHERE id=?', [id]);
      const comment = rows[0];
      if (!comment) return true; // якщо коментар не знайдено, нічого робити

      if (actor.role !== 'admin' && actor.id !== comment.author_id) {
          const e = new Error('Forbidden');
          e.status = 403;
          throw e;
      }

      // Робимо soft delete: змінюємо статус на 'inactive'
      await db.execute('UPDATE Comments SET status="inactive" WHERE id=?', [id]);
      return true;
  }

  async getComment(actorRole, commentId, userId) {
      const [rows] = await db.execute('SELECT * FROM Comments WHERE id=?', [commentId]);
      const comment = rows[0];
      if (!comment) {
          const e = new Error('Comment not found');
          e.status = 404;
          throw e;
      }

      // Перевірка доступу: якщо коментар inactive
      if (comment.status === 'inactive' && actorRole !== 'admin' && comment.author_id !== userId) {
          const e = new Error('Forbidden');
          e.status = 403;
          throw e;
      }

      return comment;
  }

    async updateComment(role, commentId, userId, status, content) {
    // Перевірка: тільки автор або адмін може оновити
    const [rows] = await db.execute(
      'SELECT * FROM Comments WHERE Id = ?',
      [commentId]
    );
    const comment = rows[0];
    if (!comment) {
      throw new Error('Comment not found');
    }
    if (role !== 'admin' && comment.Author_Id !== userId) {
      throw new Error('Forbidden');
    }

    await db.execute(
      'UPDATE Comments SET Content = ?, Status = ? WHERE Id = ?',
      [content, status, commentId]
    );

    return { id: commentId, content, status };
  }

}


module.exports = new CommentService();
