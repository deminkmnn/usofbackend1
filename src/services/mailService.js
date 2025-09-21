const nodemailer = require('nodemailer');
const tokenService = require('./tokenService'); // твій сервіс для токенів
const ApiError = require('../utils/errorForApi');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465, // true тільки якщо 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // ✅ Надсилання листа для активації
  async sendActivationMail(to, activationToken) {
    try {
      const link = `${process.env.API_URL}/api/auth/activate/${activationToken}`;

      await this.transporter.sendMail({
        from: `"Stack Overclone" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Account activation - Stack Overclone',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333">
            <h1>Activate your account</h1>
            <p>Click the button below to activate your account:</p>
            <a href="${link}" 
              style="display:inline-block;padding:10px 20px;margin-top:10px;
              background:#4CAF50;color:white;text-decoration:none;border-radius:5px;">
              Activate Account
            </a>
          </div>
        `,
      });
    } catch (err) {
      console.error('Send activation mail error:', err);
      throw ApiError.BadRequestError('Could not send activation email');
    }
  }

  // ✅ Надсилання листа для reset password
  async sendPswResetMail(to, resetToken) {
    try {
      const link = `${process.env.CLIENT_URL}/password-reset/${resetToken}`;

      await this.transporter.sendMail({
        from: `"Stack Overclone" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Password reset - Stack Overclone',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333">
            <h1>Password Reset</h1>
            <p>If you requested a password reset, click the button below:</p>
            <a href="${link}" 
              style="display:inline-block;padding:10px 20px;margin-top:10px;
              background:#f44336;color:white;text-decoration:none;border-radius:5px;">
              Reset Password
            </a>
            <p style="margin-top:20px;font-size:12px;color:#888">
              If you didn’t request this, just ignore this email.
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.error('Send reset mail error:', err);
      throw ApiError.BadRequestError('Could not send password reset email');
    }
  }
}

module.exports = new MailService();
