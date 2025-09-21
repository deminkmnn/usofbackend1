const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(__dirname, '..', '..', 'uploads')),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  }
});

const upload = multer({ storage });
module.exports = upload;
