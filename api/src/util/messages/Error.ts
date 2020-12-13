import Return from './Return';

class Error extends Return {
  constructor (message: String, code?: Number, identifier?: String) {
    super(false, code || 400, message, undefined, false, identifier);
  }
}

class RequiredFieldError extends Error {
  constructor (field: String) {
    super(field + ' is required.', 400, 'RequiredField');
  }
}

class InvalidFieldError extends Error {
  constructor (field: String, reason?: String) {
    const defaultCode = 402;
    const defaultIdentifier = 'InvalidField';

    if (reason) {
      super(field + ' ' + reason, defaultCode, defaultIdentifier);
    } else {
      super(field + ' is invalid.', defaultCode, defaultIdentifier);
    }
  }
}

class InexistentEntryError extends Error {
  constructor (entry: String, message?: String) {
    const defaultCode = 404;
    const defaultIdentifier = 'InexistentEntry';

    if (message) {
      super(entry + ' ' + message, defaultCode, defaultIdentifier);
    } else {
      super(entry + ' was not found.', defaultCode, defaultIdentifier);
    }
  }
}

class DuplicatedEntryError extends Error {
  constructor (entry: String, message?: String) {
    const defaultCode = 401;
    const defaultIdentifier = 'InexistentEntry';

    if (message) {
      super(entry + ' ' + message, defaultCode, defaultIdentifier);
    } else {
      super(entry + ' was already registered.', defaultCode, defaultIdentifier);
    }
  }
}

class RemoveError extends Error {
  constructor (entry: String, message?: String) {
    const defaultCode = 405;
    const defaultIdentifier = 'RemoveError';

    if (message) {
      super(entry + ' ' + message, defaultCode, defaultIdentifier);
    } else {
      super('It was not possible to remove ' + entry, defaultCode, defaultIdentifier);
    }
  }
}

export {
  Error,
  RequiredFieldError,
  InvalidFieldError,
  InexistentEntryError,
  DuplicatedEntryError,
  RemoveError
};
