import Return from './messages/Return';
import Success from './messages/Success';
import * as Errors from './messages/Error';
import * as Exceptions from './messages/Exception';
import { ApiReturn } from './api';
import { Interface } from 'readline';
import _ from 'lodash';

const Infra = {
  Success,
  ...Errors,
  ...Exceptions
};

export { Return, ApiReturn };

export function ToInterface<T> (target: Interface): Partial<T> {
  const obtainedPost: Partial<T> = Object
    .keys(target)
    .sort()
    .reduce((o, k) => _.set(o, k, target[k]), {});
  return obtainedPost;
}

export default Infra;
