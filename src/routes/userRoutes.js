const router = require('express').Router();
const user = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');


router.patch('/avatar', auth(), upload.single('avatar'), user.avatarUpdate);
router.patch('/:user_id', auth(), user.userUpdate);
router.delete('/:user_id', auth('admin'), user.userDelete);

// Адмін: робота з усіма користувачами
router.get('/', auth('admin'), user.allUsers);              // GET /api/users - всі користувачі
router.get('/:user_id', auth('admin'), user.userById);     // GET /api/users/:user_id
router.post('/', auth('admin'), user.adminRegistration);  // POST /api/users - створення користувача
router.delete('/:user_id', auth('admin'), user.userDelete);// DELETE /api/users/:user_id

module.exports = router;
