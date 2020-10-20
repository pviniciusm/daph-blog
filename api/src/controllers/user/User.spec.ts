import { Return } from '../../util/messages';
import Infra from '../../util';

class UserController {
  async create (request: any): Promise<Return> {
    // #region Validação de campos
    if (!request) {
      return new Infra.RequiredFieldException('Request');
    }

    if (!request.email) {
      return new Infra.RequiredFieldError('email');
    }

    if (!request.password) {
      return new Infra.RequiredFieldError('password');
    }

    if (!request.name) {
      return new Infra.RequiredFieldError('name');
    }

    if (!request.last_name) {
      return new Infra.RequiredFieldError('last_name');
    }
    // #endregion
  }
}

describe('User controller tests', () => {
  test('should return 400 if no email is provided', async () => {
    const sut = new UserController();
    const ret: Return = await sut.create({
      password: 'any_password'
    });

    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(400);
  });

  test('should return 400 if no password is provided', async () => {
    const sut = new UserController();
    const ret: Return = await sut.create({
      email: 'any_email'
    });

    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(400);
  });

  test('should return 400 if no name is provided', async () => {
    const sut = new UserController();
    const ret: Return = await sut.create({
      email: 'any_email',
      password: 'any_password'
    });

    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(400);
  });

  test('should return 400 if no last_name is provided', async () => {
    const sut = new UserController();
    const ret: Return = await sut.create({
      email: 'any_email',
      password: 'any_password',
      name: 'daphne'
    });

    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(400);
  });

  test('should return 500 if no request is provided', async () => {
    const sut = new UserController();
    const ret: Return = await sut.create(undefined);

    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(500);
  });
});
