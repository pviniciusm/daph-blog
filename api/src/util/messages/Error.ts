import Return from './Return';

class Error extends Return {
  constructor (message: String, code?: Number) {
    super(false, code || 400, message, false);
  }
}

class RequiredFieldError extends Error {
  constructor (field: String) {
    super(field + ' is required.', 400);
  }
}

export { RequiredFieldError, Error };
