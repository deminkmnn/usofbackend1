const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const crypto = require('crypto');

const generateTokens = (user) => {
  const payload = { 
    id: user.Id || user.id, 
    login: user.Login || user.login, 
    role: user.Role || user.role 
  };
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
};

const saveToken = async (UserId, refreshToken) => {
  const [rows] = await pool.query(`SELECT * FROM Tokens WHERE UserId = ?`, [UserId]);
  if (rows.length) {
    await pool.query(`UPDATE Tokens SET RefreshToken = ? WHERE UserId = ?`, [refreshToken, UserId]);
  } else {
    await pool.query(`INSERT INTO Tokens (UserId, RefreshToken) VALUES (?, ?)`, [UserId, refreshToken]);
  }
  return { UserId, refreshToken };
};

const validateAccessToken = (token) => {
  try { return jwt.verify(token, process.env.JWT_ACCESS_SECRET); }
  catch { return null; }
};

const validateRefreshToken = (token) => {
  try { return jwt.verify(token, process.env.JWT_REFRESH_SECRET); }
  catch { return null; }
};

const removeToken = async (refreshToken) => {
  await pool.query(`DELETE FROM Tokens WHERE RefreshToken = ?`, [refreshToken]);
};

const findToken = async (refreshToken) => {
  const [rows] = await pool.query(`SELECT * FROM Tokens WHERE RefreshToken = ?`, [refreshToken]);
  return rows[0] || null;
};

function generateResetToken(payload) {
  return crypto.randomBytes(32).toString('hex'); // простий випадковий токен
}

// 🔹 Генерація токена активації
function generateActivationToken(payload) {
  // payload може містити id та email користувача
  return jwt.sign(payload, process.env.JWT_ACTIVATION_SECRET, { expiresIn: '1d' }); // токен дійсний 1 день
}

// 🔹 Валідація токена активації
function validateActivationToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_ACTIVATION_SECRET);
  } catch {
    return null;
  }
}

module.exports = {
  generateTokens,
  saveToken,
  validateAccessToken,
  validateRefreshToken,
  removeToken,
  findToken,
  generateResetToken, // додаємо сюди
  generateActivationToken,
  validateActivationToken
};