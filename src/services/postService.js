const db = require('../config/db');

class PostService {
  // GET /api/posts
  async listPublic() {
    const [rows] = await db.execute(
      `SELECT p.*, u.login AS author_login
       FROM Posts p
       JOIN Users u ON u.id = p.author_id
       WHERE p.status='active'
       ORDER BY p.publish_date DESC`
    );
    return rows;
  }

  // GET /api/posts/:id
  async get(id, viewer) {
    const [rows] = await db.execute('SELECT * FROM Posts WHERE id = ?', [id]);
    const post = rows[0];
    if (!post) return null;
    if (post.status === 'inactive' && (!viewer || (viewer.role !== 'admin' && viewer.id !== post.author_id))) {
      return null;
    }
    return post;
  }

  async getPostCategories(postId) {
      const [rows] = await db.execute(
          `SELECT c.id, c.title
          FROM PostCategories pc
          JOIN Categories c ON c.id = pc.category_id
          WHERE pc.post_id = ?`, 
          [postId]
      );
      return rows;
  }

  // Всередині PostService
  async getPostsByCategory(categoryId, viewerId = null, viewerRole = 'user') {
      let query = `
          SELECT p.*, u.login AS author_login
          FROM Posts p
          JOIN Users u ON u.id = p.author_id
          JOIN PostCategories pc ON pc.post_id = p.id
          WHERE pc.category_id = ?`;

      const params = [categoryId];

      // Якщо не admin, беремо тільки активні
      if (viewerRole !== 'admin') {
          query += ' AND p.status="active"';
      }

      query += ' ORDER BY p.publish_date DESC';

      const [rows] = await db.execute(query, params);
      return rows;
  }

  async getPostLikes(postId, type = null, userId = null) {
      let query = `SELECT * FROM Likes WHERE target_type='post' AND target_id=?`;
      const params = [postId];

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

  // POST /api/posts
  async create(author_id, { title, content, categories }) {
      // Перевірка обов'язкових полів
      if (!title) throw new Error('Title is required');
      if (!content) throw new Error('Content is required');
      if (!Array.isArray(categories) || categories.length === 0) {
          throw new Error('Categories must be a non-empty array');
      }

      // Вставка поста
      const [res] = await db.execute(
        'INSERT INTO Posts (author_id, title, content) VALUES (?, ?, ?)',
        [author_id, title, content]
      );
      const postId = res.insertId;

      // Вставка категорій
      const values = categories.map(cid => [postId, cid]);
      await db.query('INSERT INTO PostCategories (post_id, category_id) VALUES ?', [values]);

      // Повернути повний пост
      return this.get(postId, { id: author_id, role: 'user' });
  }



  // PATCH /api/posts/:id
  async update(id, editor, { title, content }) {
    const post = await this.get(id, editor);
    if (!post) { const e = new Error('Post not found or access denied'); e.status = 404; throw e; }
    if (editor.role !== 'admin' && editor.id !== post.author_id) {
      const e = new Error('Forbidden'); e.status = 403; throw e;
    }
    await db.execute('UPDATE Posts SET title=?, content=? WHERE id=?', [
      title ?? post.title,
      content ?? post.content,
      id
    ]);
    return this.get(id, editor);
  }

  // DELETE /api/posts/:id
  async remove(id, actor) {
    const post = await this.get(id, actor);
    if (!post) { const e = new Error('Post not found or access denied'); e.status = 404; throw e; }
    if (actor.role !== 'admin' && actor.id !== post.author_id) {
      const e = new Error('Forbidden'); e.status = 403; throw e;
    }
    await db.execute('DELETE FROM Posts WHERE id=?', [id]);
    return true;
  }

  // PUT /api/posts/:id/status
  async setStatus(id, status) {
    await db.execute('UPDATE Posts SET status=? WHERE id=?', [status, id]);
    const [rows] = await db.execute('SELECT * FROM Posts WHERE id=?', [id]);
    return rows[0] || null;
  }
}

module.exports = new PostService();
