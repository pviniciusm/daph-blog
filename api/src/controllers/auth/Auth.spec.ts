import { Return, RequiredFieldError, Success, RequiredFieldException } from '../../util/messages';

class LoginController {
  login (request: any): Return {
    if (!request) {
      return new RequiredFieldException('Request');
    }

    if (!request.email) {
      return new RequiredFieldError('email');
    }

    if (!request.password) {
      return new RequiredFieldError('password');
    }

    return new Success(true, 'Operação realizada com sucesso');
  }
}

describe('Login contoller', () => {
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
