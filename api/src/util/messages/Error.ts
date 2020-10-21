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

class InvalidFieldError extends Error {
  constructor (field: String, reason?: String) {
    const defaultCode = 402;

    if (reason) {
      super(field + '' + reason, defaultCode);
    } else {
      super(field + ' is invalid.', defaultCode);
    }
  }
}

export { RequiredFieldError, InvalidFieldError, Error };
