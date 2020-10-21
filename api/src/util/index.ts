import Return from './messages/Return';
import Success from './messages/Success';
import { RequiredFieldError, InvalidFieldError, Error } from './messages/Error';
import { RequiredFieldException, Exception } from './messages/Exception';
import { ApiReturn } from './api';

const Infra = {
  Success,
  RequiredFieldError,
  InvalidFieldError,
  Error,
  RequiredFieldException,
  Exception
};

export { Return, ApiReturn };
export default Infra;
