const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'supersecretkey';

function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.Role }, SECRET, { expiresIn: '2h' });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { generateToken, verifyToken };
