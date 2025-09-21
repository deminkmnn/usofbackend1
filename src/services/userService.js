const fs = require('fs');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const errorForApi = require('../utils/errorForApi');

/** Видалення файлу */
const removeFile = (path) => {
  try { fs.unlinkSync(path); } catch (err) { console.log(err.message); }
};

/** ВСІ КОРИСТУВАЧІ */
const getAllUsers = async () => {
  const [users] = await pool.query(`SELECT * FROM Users`);
  if (!users.length) throw errorForApi.NothingFoundError();
  return users;
};

/** КОРИСТУВАЧ ПО ID */
const getUser = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM Users WHERE id = ?`, [id]);
  if (!rows.length) throw errorForApi.NothingFoundError();
  return rows[0];
};

/** РЕЄСТРАЦІЯ АДМІНОМ */
const RegistrationByAdmin = async (
  email,
  login,
  password,
  repeatedPassword,
  full_name = '',
  role = 'user'
) => {
  await checkEmailLoginUnique(email, login);

  if (password !== repeatedPassword) {
    throw errorForApi.BadRequestError('Passwords do not match');
  }

  const hashPassword = await bcrypt.hash(password, 4);

  const [result] = await pool.query(
    `INSERT INTO Users (email, login, password, full_name, role, Is_Activated) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [email, login, hashPassword, full_name, role, true] // ✅ одразу активований
  );

  return {
    id: result.insertId,
    email,
    login,
    full_name,
    role,
    isActivated: true
  };
};


/** ОНОВЛЕННЯ АВАТАРКИ */
const avatarUpdate = async (fileName, userId) => {
  const [rows] = await pool.query(`SELECT Avatar FROM Users WHERE id = ?`, [userId]);
  if (!rows.length) throw errorForApi.BadRequestError('User not found');
  if (rows[0].Avatar) removeFile(`uploads/${rows[0].Avatar}`);
  await pool.query(`UPDATE Users SET Avatar = ? WHERE id = ?`, [fileName, userId]);
  return getUser(userId);
};

/** ОНОВЛЕННЯ ЮЗЕРА */
const updateUser = async (isOwner, data, userId) => {
  const fields = [];
  const values = [];
  if (data.full_name) { fields.push('full_name = ?'); values.push(data.full_name); }
  if (data.role && !isOwner) { fields.push('role = ?'); values.push(data.role); }
  if (!fields.length) return getUser(userId);
  values.push(userId);
  await pool.query(`UPDATE Users SET ${fields.join(', ')} WHERE id = ?`, values);
  return getUser(userId);
};

/** ВИДАЛЕННЯ ЮЗЕРА */
const deleteUser = async (id) => {
  const [rows] = await pool.query(`SELECT Avatar FROM Users WHERE id = ?`, [id]);
  if (!rows.length) throw errorForApi.BadRequestError('User not found');
  if (rows[0].Avatar) removeFile(`uploads/${rows[0].Avatar}`);
  await pool.query(`DELETE FROM Users WHERE id = ?`, [id]);
};

/** ПЕРЕВІРКА УНІКАЛЬНОСТІ EMAIL/LOGIN */
const checkEmailLoginUnique = async (email, login) => {
  const [emailRows] = await pool.query(`SELECT id FROM Users WHERE email = ?`, [email]);
  if (emailRows.length) throw errorForApi.BadRequestError(`User with email ${email} is already registered`);
  const [loginRows] = await pool.query(`SELECT id FROM Users WHERE login = ?`, [login]);
  if (loginRows.length) throw errorForApi.BadRequestError(`User with login ${login} is already registered`);
};

module.exports = {
  getAllUsers,
  getUser,
  RegistrationByAdmin,
  avatarUpdate,
  updateUser,
  deleteUser
};
