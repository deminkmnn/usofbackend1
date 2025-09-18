const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const tokenService = require('../services/tokenService');
const mailService = require('../services/mailService');
const errorForApi = require('../utils/errorForApi');

const handleValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw errorForApi.BadRequestError('Validation error', errors.array());
  }
};

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    maxAge: 30 * 24 * 3600 * 1000,
    httpOnly: true,
  });
};

const registration = async (req, res, next) => {
  try {
    handleValidation(req);

    const { email, login, password, repeatedPassword, full_name } = req.body;
    const { user, activationToken } = await authService.register(
      email,
      login,
      password,
      repeatedPassword,
      full_name
    );

    // 🔹 Надсилаємо лист для активації
    await mailService.sendActivationMail(email, activationToken);

    return res.status(201).json({
      message: 'User registered successfully. Check your email to activate your account.',
      user
    });
  } catch (err) {
    next(err);
  }
};


const login = async (req, res, next) => {
  try {
    const { login, password } = req.body;

    // 1️⃣ Авторизація користувача
    const user = await authService.login(login, password);

    // 2️⃣ Генеруємо токени
    const tokens = tokenService.generateTokens(user);

    // 3️⃣ Зберігаємо refreshToken у базі
    await tokenService.saveToken(user.id, tokens.refreshToken);

    // 4️⃣ Кладемо токени в cookies
    res.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 30 * 24 * 3600 * 1000, // 30 днів
      httpOnly: true,
    });

    res.cookie('accessToken', tokens.accessToken, {
      maxAge: 30 * 60 * 1000, // 30 хв
      httpOnly: true,
    });

    // 5️⃣ Віддаємо клієнту дані користувача
    return res.json({
      user: {
        id: user.id,
        login: user.login,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      }
    });

  } catch (err) {
    next(err);
  }
};



const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) await tokenService.removeToken(refreshToken);

    res.clearCookie('refreshToken');
    return res.status(204).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

const passwordReset = async (req, res, next) => {
  try {
    handleValidation(req);

    const { email } = req.body;
    const token = await authService.createPasswordResetToken(email);

    // Надсилаємо лист користувачу
    await mailService.sendPswResetMail(email, token);

    return res.status(200).json({ success: true, message: 'Reset link sent to your email' });
  } catch (err) {
    next(err);
  }
};

const passwordConfirm = async (req, res, next) => {
  try {
    handleValidation(req);

    const token = req.params.confirm_token;
    const { password, repeatedPassword } = req.body;

    if (password !== repeatedPassword) {
      return next(errorForApi.BadRequestError('Passwords do not match'));
    }

    await authService.resetPassword(token, password);

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};


const activation = async (req, res, next) => {
  try {
    const token = req.params.confirm_token;
    await authService.activate(token);

    return res.redirect(process.env.CLIENT_URL);
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const userData = await authService.refreshToken(refreshToken);

    setRefreshCookie(res, userData.refreshToken);

    const { refreshToken: _, ...dataWithoutToken } = userData;
    return res.status(200).json(dataWithoutToken);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registration,
  login,
  logout,
  passwordReset,
  passwordConfirm,
  activation,
  refreshToken,
};
