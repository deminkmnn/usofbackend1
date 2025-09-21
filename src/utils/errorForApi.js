module.exports = class errorForApi extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthorizedError() {
    return new errorForApi(401, 'User is not authorized');
  }

  static BadRequestError(message, errors = []) {
    return new errorForApi(400, message, errors);
  }

  static ForbiddenError(message = 'Only admins can do this', errors = []) {
    return new errorForApi(403, message, errors);
  }

  static NothingFoundError(message = 'Nothing Found', errors = []) {
    return new errorForApi(404, message, errors);
  }
};