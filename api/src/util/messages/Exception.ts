import Return from './Return';

class Exception extends Return {
  constructor (message: String, code?: Number, identifier?: String) {
    super(false, code || 500, message, undefined, true, identifier);
  }
}

class RequiredFieldException extends Exception {
  constructor (field: String) {
    super(field + ' is required.', 500, 'RequiredFieldException');
  }
}

export { RequiredFieldException, Exception };
