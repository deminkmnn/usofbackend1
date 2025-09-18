const db = require('../config/db');

class CategoryService {
  async getAllCategories() {
    const [rows] = await db.execute('SELECT * FROM Categories ORDER BY Title ASC');
    return rows;
  }

  async getCategory(id) {
    const [rows] = await db.execute('SELECT * FROM Categories WHERE Id=?', [id]);
    return rows[0];
  }

  async createCategory(title, description) {
    const [res] = await db.execute(
      'INSERT INTO Categories (title, description) VALUES (?,?)',
      [title, description ?? null]
    );
    const [rows] = await db.execute('SELECT * FROM Categories WHERE Id=?', [res.insertId]);
    return rows[0];
  }

  async updateCategory(id, title, description) {
    await db.execute(
      'UPDATE Categories SET title=?, description=? WHERE id=?',
      [title, description ?? null, id]
    );
    const [rows] = await db.execute('SELECT * FROM Categories WHERE Id=?', [id]);
    return rows[0];
  }

  async deleteCategory(id) {
    await db.execute('DELETE FROM Categories WHERE Id=?', [id]);
    return true;
  }
}

module.exports = new CategoryService();
