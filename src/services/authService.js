const db = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const tokenService = require('./tokenService');

class AuthService {
  async register(email, login, password, repeatedPassword, full_name) {
    if (password !== repeatedPassword) {
      const err = new Error('Passwords do not match');
      err.status = 400;
      throw err;
    }

    const [exists] = await db.execute(
      'SELECT id FROM Users WHERE login = ? OR email = ?',
      [login, email]
    );
    if (exists.length) {
      const err = new Error('User with this login or email already exists');
      err.status = 400;
      throw err;
    }

    const hashed = await bcrypt.hash(password, 10);
    const [res] = await db.execute(
      'INSERT INTO Users (login, password, email, full_name, role) VALUES (?,?,?,?,?)',
      [login, hashed, email, full_name, 'user']
    );

    const user = { id: res.insertId, login, email, full_name, role: 'user' };

    // 🔹 Генеруємо токен активації
    const activationToken = tokenService.generateActivationToken({ id: user.id, email: user.email });

    return { user, activationToken };
  }

  async login(login, password) {
    const [rows] = await db.execute('SELECT * FROM Users WHERE login = ?', [login]);
    if (!rows.length) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    const user = rows[0];

    if (!user.Is_Activated) {
      const err = new Error('Account not activated. Please check your email.');
      err.status = 403;
      throw err;
    }

    const ok = await bcrypt.compare(password, user.Password);
    if (!ok) {
      const err = new Error('Invalid password');
      err.status = 401;
      throw err;
    }

    return {
      id: user.Id,
      login: user.Login,
      email: user.Email,
      role: user.Role,
      full_name: user.Full_name,
    };
  }

  async createPasswordResetToken(email) {
    const [rows] = await db.execute('SELECT Id FROM Users WHERE Email = ?', [email]);
    if (!rows.length) { const e = new Error('User not found'); e.status = 404; throw e; }

    const token = crypto.randomBytes(32).toString('hex');
    const expire = new Date(Date.now() + 15 * 60 * 1000); // 15 хв
    await db.execute(
      'UPDATE Users SET Reset_Token = ?, Reset_Token_Expire = ? WHERE Email = ?',
      [token, expire, email]
    );
    return token;
  }

  async resetPassword(token, newPassword) {
    const [rows] = await db.execute(
      'SELECT * FROM Users WHERE Reset_Token = ? AND Reset_Token_Expire > NOW()',
      [token]
    );
    if (!rows.length) { const e = new Error('Invalid or expired token'); e.status = 400; throw e; }

    const user = rows[0];
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.execute(
      'UPDATE Users SET Password = ?, Reset_Token = NULL, Reset_Token_Expire = NULL WHERE Id = ?',
      [hashed, user.Id]
    );
    return true;
  }

  async activate(token) {
    const payload = tokenService.validateActivationToken(token);
    if (!payload) {
      const e = new Error('Invalid or expired activation token');
      e.status = 400;
      throw e;
    }

    // Оновлюємо користувача в БД
    await db.execute(
      'UPDATE Users SET Is_Activated = TRUE WHERE Id = ?',
      [payload.id]
    );

    return true;
  }

}

module.exports = new AuthService();
