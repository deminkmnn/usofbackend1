// src/routes/adminRoutes.js
const express = require('express');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db');

const router = express.Router();

// Головна сторінка адмін-панелі
router.get('/', authMiddleware('admin'), (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/admin-panel.html'));
});

// API для статистики
router.get('/api/stats', authMiddleware('admin'), async (req, res) => {
    try {
        const [usersCount] = await db.execute('SELECT COUNT(*) as count FROM Users');
        const [postsCount] = await db.execute('SELECT COUNT(*) as count FROM Posts');
        const [commentsCount] = await db.execute('SELECT COUNT(*) as count FROM Comments');
        const [categoriesCount] = await db.execute('SELECT COUNT(*) as count FROM Categories');
        const [activePosts] = await db.execute('SELECT COUNT(*) as count FROM Posts WHERE status = "active"');
        const [inactivePosts] = await db.execute('SELECT COUNT(*) as count FROM Posts WHERE status = "inactive"');

        res.json({
            users: usersCount[0].count,
            posts: postsCount[0].count,
            comments: commentsCount[0].count,
            categories: categoriesCount[0].count,
            activePosts: activePosts[0].count,
            inactivePosts: inactivePosts[0].count
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API для отримання всіх користувачів з додатковою інформацією
router.get('/api/users', authMiddleware('admin'), async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT u.*, 
                   COUNT(DISTINCT p.id) as posts_count,
                   COUNT(DISTINCT c.id) as comments_count,
                   COUNT(DISTINCT l.id) as likes_count
            FROM Users u
            LEFT JOIN Posts p ON u.id = p.author_id
            LEFT JOIN Comments c ON u.id = c.author_id  
            LEFT JOIN Likes l ON u.id = l.author_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `);

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API для отримання всіх постів
router.get('/api/posts', authMiddleware('admin'), async (req, res) => {
    try {
        const [posts] = await db.execute(`
            SELECT p.*, u.login as author_login, u.full_name as author_name,
                   COUNT(DISTINCT c.id) as comments_count,
                   COUNT(DISTINCT CASE WHEN l.type = 'like' THEN l.id END) as likes_count,
                   COUNT(DISTINCT CASE WHEN l.type = 'dislike' THEN l.id END) as dislikes_count
            FROM Posts p
            LEFT JOIN Users u ON p.author_id = u.id
            LEFT JOIN Comments c ON p.id = c.post_id
            LEFT JOIN Likes l ON p.id = l.target_id AND l.target_type = 'post'
            GROUP BY p.id
            ORDER BY p.publish_date DESC
        `);

        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Додаткові API для статусів постів та коментарів
router.patch('/api/posts/:id/status', authMiddleware('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db.execute('UPDATE Posts SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Post status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/api/comments', authMiddleware('admin'), async (req, res) => {
    try {
        const [comments] = await db.execute(`
            SELECT c.*, u.login as author_login, u.full_name as author_name,
                   p.title as post_title,
                   COUNT(DISTINCT CASE WHEN l.type = 'like' THEN l.id END) as likes_count,
                   COUNT(DISTINCT CASE WHEN l.type = 'dislike' THEN l.id END) as dislikes_count
            FROM Comments c
            LEFT JOIN Users u ON c.author_id = u.id
            LEFT JOIN Posts p ON c.post_id = p.id
            LEFT JOIN Likes l ON c.id = l.target_id AND l.target_type = 'comment'
            GROUP BY c.id
            ORDER BY c.publish_date DESC
        `);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/api/comments/:id/status', authMiddleware('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db.execute('UPDATE Comments SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Comment status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Експорт роутера через CommonJS
module.exports = router;
