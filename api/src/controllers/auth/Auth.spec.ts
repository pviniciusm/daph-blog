import { Return } from '../../util/messages';
import Infra from '../../util';

class LoginController {
  login (request: any): Return {
    if (!request) {
      return new Infra.RequiredFieldException('Request');
    }

    if (!request.email) {
      return new Infra.RequiredFieldError('email');
    }

    if (!request.password) {
      return new Infra.RequiredFieldError('password');
    }

    return new Infra.Success(true, 'Operação realizada com sucesso');
  }
}

describe('Login controller tests', () => {
  test('should return 400 if no email is provided', () => {
    const sut = new LoginController();
    const ret: Return = sut.login({
      password: 'any_password'
    });

    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(400);
  });

  test('should return 400 if no password is provided', () => {
    const sut = new LoginController();
    const ret: Return = sut.login({
      email: 'any_email'
    });

    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(400);
  });

  it('should return 500 if no request is provided', () => {
    const sut = new LoginController();
    const ret = sut.login(undefined);

    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(500);
  });
});
