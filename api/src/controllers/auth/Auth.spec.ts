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

    // TODO:
    // (1) validar se e-mail é válido
    // (2) validar se senha é válida (maior que X caracteres)
    // (3) validar se usuário existe
    // (4) validar se senha informada é correta
    // (5) criar token de acesso
    // (6) retornar token

    return new Infra.Success(true, 'Operação realizada com sucesso');
  }
}

describe('Login tests', () => {
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

  test('should return 500 if no request is provided', () => {
    const sut = new LoginController();
    const ret = sut.login(undefined);

    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(500);
  });
});
