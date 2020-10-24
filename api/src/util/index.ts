import Return from './messages/Return';
import Success from './messages/Success';
import * as Errors from './messages/Error';
import * as Exceptions from './messages/Exception';
import { ApiReturn } from './api';

const Infra = {
  Success,
  ...Errors,
  ...Exceptions
};

export { Return, ApiReturn };
export default Infra;
