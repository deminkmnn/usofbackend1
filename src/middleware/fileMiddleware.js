const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Папка для зберігання аватарів
const avatarsDir = './static/avatars';

// Переконуємось, що папка існує
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, avatarsDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname); // зберігаємо правильне розширення
    cb(null, `${Date.now()}-${req.user.id}${ext}`);
  },
});

// Дозволені типи файлів
const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'), false);
  }
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }); // обмеження 2MB
