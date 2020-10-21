import Infra, { Return } from '../../util';

const validUser = {
  email: 'email@test.com',
  password: '12345',
  name: 'Daphne',
  lastName: 'the Puppy'
};

class UserController {
  async create (request: any): Promise<Return> {
    // #region Validação de campos
    if (!request) {
      return new Infra.RequiredFieldException('Request');
    }

    const { email, password, name, lastName } = request;

    if (!email) {
      return new Infra.RequiredFieldError('email');
    }

    if (!password) {
      return new Infra.RequiredFieldError('password');
    }

    if (!name) {
      return new Infra.RequiredFieldError('name');
    }

    if (!lastName) {
      return new Infra.RequiredFieldError('last_name');
    }
    // #endregion

    // #region Validate if fields are valid
    const strPassword = password.toString();

    if (strPassword.length < 5 || strPassword.length > 50) {
      return new Infra.InvalidFieldError('Password', 'must have more than 5 characters and less than 50');
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

  test('should return 402 if password has less than 5 characters', async () => {
    const sut = new UserController();
    const user = validUser;
    user.password = '123';

    const ret = await sut.create(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(402);
  });

  test('should return 402 if password has more than 50 characters', async () => {
    const sut = new UserController();
    const user = validUser;
    user.password = 'this password is too long so the create method must fail with 402';

    const ret = await sut.create(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(402);
  });
});
