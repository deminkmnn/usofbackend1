const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = new Router();

// POST /api/auth/register
router.post(
  '/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6, max: 32 }),
  body('login').isLength({ min: 3, max: 30 }),
  body('repeatedPassword').exists(),
  authController.registration
);

// POST /api/auth/login
router.post(
  '/login',
  body('login').notEmpty(),
  body('password').notEmpty(),
  authController.login
);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// POST /api/auth/password-reset
router.post(
  '/password-reset',
  body('email').isEmail(),
  authController.passwordReset
);

router.post(
  '/password-reset/:confirm_token',
  body('password').isLength({ min: 6 }),
  authController.passwordConfirm
);

router.get('/activate/:confirm_token', authController.activation);

router.get('/password-reset/:confirm_token', (req, res) => {
  const { token } = req.params;
  return res.redirect(`${process.env.CLIENT_URL}/password-reset/${token}`);
});

module.exports = router;
