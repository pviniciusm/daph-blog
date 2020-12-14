/* eslint-disable @typescript-eslint/no-unused-vars */
import { Return } from '../../util';
import CustomMatcherResult from 'jest';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidCode: (expected: Number) => CustomMatcherResult;
    }
  }
}

expect.extend({
  toHaveValidCode (returned: Return, validCode:Number) {
    if (returned.code !== validCode) {
      return {
        message: () => `Return code is not valid due to following error: ${returned.message}`,
        pass: false
      };
    }

    return {
      message: () => 'Return code is valid',
      pass: true
    };
  }
});

export default undefined;