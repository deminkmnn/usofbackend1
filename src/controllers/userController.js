const { validationResult } = require('express-validator');
const userService = require('../services/userService');
const errorForApi = require('../utils/errorForApi');

// Helper to handle validation errors
const handleValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw errorForApi.BadRequestError('Validation error', errors.array());
  }
};

// GET ALL USERS
const allUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

// GET USER BY ID
const userById = async (req, res, next) => {
  try {
    const id = req.params.user_id;
    const user = await userService.getUser(id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// ADMIN REGISTRATION
const adminRegistration = async (req, res, next) => {
  try {
    handleValidation(req);
    const { email, login, password, repeatedPassword, full_name, role } = req.body;

    const userData = await userService.RegistrationByAdmin(
      email,
      login,
      password,
      repeatedPassword,
      full_name,
      role
    );

    res.status(201).json(userData);
  } catch (err) {
    next(err);
  }
};

const avatarUpdate = async (req, res, next) => {
  try {
    if (!req.file) throw errorForApi.BadRequestError('No avatar uploaded');
    const userId = req.user.id; // id з токена
    const updatedUser = await userService.avatarUpdate(req.file.filename, userId);
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

// UPDATE USER
const userUpdate = async (req, res, next) => {
  try {
    const isOwner = req.user.id === parseInt(req.params.user_id);
    const updatedUser = await userService.updateUser(isOwner, req.body, req.params.user_id);
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

// DELETE USER
const userDelete = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.user_id);
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  allUsers,
  userById,
  adminRegistration,
  avatarUpdate,
  userUpdate,
  userDelete,
};

