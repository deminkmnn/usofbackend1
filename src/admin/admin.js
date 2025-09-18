// src/admin/admin.js
const AdminJS = require('adminjs').default;
const AdminJSExpress = require('@adminjs/express');
const db = require('../config/db');
const bcrypt = require('bcrypt');

const adminJs = new AdminJS({
  rootPath: '/admin',
  branding: { companyName: 'USOF Admin' },

  // Custom Pages без React-компонентів
  pages: {
    Users: {
      label: 'Users',
      handler: async () => {
        const [rows] = await db.execute('SELECT * FROM Users');
        return { rows }; // повертаємо JSON
      },
    },
    Posts: {
      label: 'Posts',
      handler: async () => {
        const [rows] = await db.execute('SELECT * FROM Posts');
        return { rows };
      },
    },
    Comments: {
      label: 'Comments',
      handler: async () => {
        const [rows] = await db.execute('SELECT * FROM Comments');
        return { rows };
      },
    },
    Categories: {
      label: 'Categories',
      handler: async () => {
        const [rows] = await db.execute('SELECT * FROM Categories');
        return { rows };
      },
    },
  },
});

// Аутентифікація
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
  authenticate: async (email, password) => {
    const [rows] = await db.execute(
      'SELECT * FROM Users WHERE Email = ? AND Role = "admin"',
      [email]
    );
    if (!rows.length) return null;

    const user = rows[0];
    const matched = await bcrypt.compare(password, user.Password);
    if (matched) return user;
    return null;
  },
  cookieName: 'adminjs',
  cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'supersecretkey',
});

module.exports = { adminJs, adminRouter };
