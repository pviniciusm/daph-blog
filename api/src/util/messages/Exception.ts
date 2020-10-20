import Return from './Return';

class Exception extends Return {
  constructor (message: String, code?: Number) {
    super(false, code || 500, message, undefined, true);
  }
}

class RequiredFieldException extends Exception {
  constructor (field: String) {
    super(field + ' is required.', 500);
  }
}

export { RequiredFieldException, Exception };
