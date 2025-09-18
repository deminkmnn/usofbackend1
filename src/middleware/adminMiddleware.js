const ApiError = require('../utils/errorForApi');

module.exports = (requiredRole = 'admin') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return next(ApiError.UnauthorizedError());
      }
      if (req.user.role !== requiredRole) {
        return next(ApiError.ForbiddenError());
      }
      next();
    } catch (err) {
      return next(ApiError.ForbiddenError());
    }
  };
};
