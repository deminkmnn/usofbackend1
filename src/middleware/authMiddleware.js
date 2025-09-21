const jwt = require('jsonwebtoken');
const db = require('../config/db');
const ApiError = require('../utils/errorForApi');

const authMiddleware = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      let token = null;

      // 1️⃣ Беремо токен з Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log('Token taken from header');
      }

      // 2️⃣ Якщо нема, беремо з cookies (accessToken)
      if (!token && req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
        console.log('Token taken from cookie');
      }

      // 3️⃣ Якщо токена нема
      if (!token) {
        console.log('Auth failed: no token provided');
        return next(ApiError.UnauthorizedError('No token provided'));
      }

      // 4️⃣ Верифікація токена
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      } catch (err) {
        console.log('Auth failed: invalid token', err.message);
        return next(ApiError.UnauthorizedError('Invalid token'));
      }

      // 5️⃣ Дістаємо користувача з БД
      const [rows] = await db.execute(
        'SELECT Id as id, Login as login, Email as email, Role as role, full_name FROM Users WHERE Id = ?',
        [decoded.id]
      );

      if (!rows.length) {
        console.log('Auth failed: user not found');
        return next(ApiError.UnauthorizedError('User not found'));
      }

      req.user = rows[0];

      // 6️⃣ Перевірка ролі, якщо задана
      if (requiredRole && req.user.role.toLowerCase() !== requiredRole.toLowerCase()) {
        console.log('Auth failed: forbidden role', req.user.role, requiredRole);
        return next(ApiError.ForbiddenError('User role forbidden'));
      }

      next();
    } catch (err) {
      console.error('Auth middleware error:', err);
      return next(ApiError.UnauthorizedError('Auth middleware error'));
    }
  };
};

module.exports = authMiddleware;
