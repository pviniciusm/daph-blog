import UserModel, { IUser } from '../../database/models/UserModel';
import createDBConn from '../../database/connection';
import Infra, { Return } from '../../util';

const validUser: Partial<IUser> = {
  email: 'email@test.com',
  password: '12345',
  repeatPassword: '12345',
  name: 'Daphne',
  lastName: 'the Puppy'
};

const alreadyRegisteredUser: Partial<IUser> = {
  email: 'daphne@teste.com',
  password: '12345',
  repeatPassword: '12345',
  name: 'Daphne',
  lastName: 'the Puppy'
};

class UserController {
  async create (request: Partial<IUser>): Promise<Return> {
    try {
      // #region Fields validation
      if (!request) {
        return new Infra.RequiredFieldException('Request');
      }

      const { email, password, repeatPassword, name, lastName } = request;

      if (!email) {
        return new Infra.RequiredFieldError('E-mail');
      }

      if (!password) {
        return new Infra.RequiredFieldError('Password');
      }

      if (!repeatPassword) {
        return new Infra.RequiredFieldError('Repeat Password');
      }

      if (!name) {
        return new Infra.RequiredFieldError('Name');
      }

      if (!lastName) {
        return new Infra.RequiredFieldError('Last Name');
      }
      // #endregion

      // #region Validate if fields are valid
      if (password.length < 5 || password.length > 50) {
        return new Infra.InvalidFieldError('Password', 'must have more than 5 characters and less than 50');
      }

      if (email.length < 5 || email.length > 77) {
        return new Infra.InvalidFieldError('E-mail', 'must have more than 5 characters and less than 77');
      }

      if (password !== repeatPassword) {
        return new Infra.InvalidFieldError('Repeat Password', 'must be equal to the Password.');
      }
      // #endregion

      // #region Check if user already exists
      const userModel: UserModel = new UserModel();
      const retFindUser: Return = await userModel.get({
        email
      });

      if (retFindUser.ok) {
        return new Infra.DuplicatedEntryError('User');
      }
      // #endregion
    } catch (err) {
      return new Infra.Exception(err.toString(), 500);
    }
  }
}

describe('User create tests', () => {
  beforeAll(async () => {
    return await createDBConn();
  });

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

  test('should return 402 if password and repeat password are different', async () => {
    const sut = new UserController();
    const user = validUser;
    user.repeatPassword = 'passwords dont match.';

    const ret = await sut.create(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(402);

    expect(ret.identifier).toBeDefined();
    expect(ret.identifier).toBe('InvalidField');
  });

  test('should return 402 if email has less than 5 characters', async () => {
    const sut = new UserController();
    const user = validUser;
    user.email = 'e@ma';

    const ret = await sut.create(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(402);
  });

  test('should return 402 if email has more than 50 characters', async () => {
    const sut = new UserController();
    const user = validUser;
    user.email = 'an_incredible_big_email@that.wont.pass.the.validation.com';

    const ret = await sut.create(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(402);
  });

  test('should return 401 if user is already registered', async () => {
    const sut = new UserController();
    const user = alreadyRegisteredUser;

    const ret = await sut.create(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(401);
  });
});
