// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Users
router.get('/users', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM Users');
  res.json(rows);
});

// Posts
router.get('/posts', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM Posts');
  res.json(rows);
});

// Comments
router.get('/comments', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM Comments');
  res.json(rows);
});

// Categories
router.get('/categories', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM Categories');
  res.json(rows);
});

module.exports = router;
