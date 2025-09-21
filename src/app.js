require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');


// === Роути ===
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/userRoutes');
const postsRoutes = require('./routes/postRoutes');
const categoriesRoutes = require('./routes/categoryRoutes');
const commentsRoutes = require('./routes/commentRoutes');

// === Middleware для обробки помилок ===
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// === Middleware сесії ===
app.use(
  session({
    secret: process.env.JWT_ACCESS_SECRET || 'supersecretkey',
    store: new session.MemoryStore(),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 10 }, // 10 хвилин
  })
);

// === Middleware для парсингу тіла запитів та інших ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('static'));
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));

// === API Роути ===
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/comments', commentsRoutes);

// === Health check ===
app.get('/', (req, res) => res.send('OK'));

const adminApiUsers = require('./routes/adminRoutes');
app.use('/api/admin/users', adminApiUsers);

// === Error middleware ===
app.use(errorMiddleware);

module.exports = app;
