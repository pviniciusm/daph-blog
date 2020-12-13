import UserModel, { IUser } from '../../database/models/UserModel';
import createDBConn from '../../database/connection';
import connection from '../../database/getConnection';
import Infra, { Return } from '../../util';
import bcryptjs from 'bcryptjs';

const validUser: Partial<IUser> = {
  email: 'email@teste.com',
  password: '123456',
  repeatPassword: '123456',
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
  private model: UserModel;

  constructor (model?: UserModel) {
    this.model = model || new UserModel();
  }

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
      const retFindUser: Return = await this.model.get({
        email
      });

      if (retFindUser.ok) {
        return new Infra.DuplicatedEntryError('User');
      }
      // #endregion

      // #region Encrypt password via bcrypt method
      const encryptedPassword = bcryptjs.hashSync(password, 10);
      // #endregion

      // #region Try to create user on database
      const toCreateUser: IUser = {
        email,
        password: encryptedPassword,
        name,
        lastName
      };

      const retCreateUser: Return = await this.model.create(toCreateUser);
      if (!retCreateUser.ok) {
        return retCreateUser;
      }

      return new Infra.Success(retCreateUser.data, 'User created successfully.');
      // #endregion
    } catch (err) {
      return new Infra.Exception(err.toString(), 500);
    }
  }

  async get (request: Partial<IUser>): Promise<Return> {
    try {
      if (!request) {
        return new Infra.RequiredFieldException('Request');
      }

      const { email } = request;

      if (!email) {
        return new Infra.RequiredFieldError('E-mail');
      }

      return await this.model.get({ email });
    } catch (err) {
      return new Infra.Exception(err.toString(), 500);
    }
  }

  async remove (request: Partial<IUser>): Promise<Return> {
    try {
      if (!request) {
        return new Infra.RequiredFieldException('Request');
      }

      const { email } = request;

      if (!email) {
        return new Infra.RequiredFieldError('E-mail');
      }

      const retUser: Return = await this.model.get({ email });
      if (!retUser.ok) {
        return retUser;
      }

      return this.model.remove({ email });
    } catch (err) {
      return new Infra.Exception(err.toString(), 500);
    }
  }
}

describe('User create tests', () => {
  beforeAll(async () => {
    if (!connection()) {
      return await createDBConn();
    }
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
    const user = { ...validUser };
    user.password = '123';

    const ret = await sut.create(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(402);
  });

  test('should return 402 if password has more than 50 characters', async () => {
    const sut = new UserController();
    const user = { ...validUser };
    user.password = 'this password is too long so the create method must fail with 402';

    const ret = await sut.create(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(402);
  });

  test('should return 402 if password and repeat password are different', async () => {
    const sut = new UserController();
    const user = { ...validUser };
    user.repeatPassword = 'passwords dont match.';

    const ret = await sut.create(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(402);

    expect(ret.identifier).toBeDefined();
    expect(ret.identifier).toBe('InvalidField');
  });

  test('should return 402 if email has less than 5 characters', async () => {
    const sut = new UserController();
    const user = { ...validUser };
    user.email = 'e@ma';

    const ret = await sut.create(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(402);
  });

  test('should return 402 if email has more than 50 characters', async () => {
    const sut = new UserController();
    const user = { ...validUser };
    user.email = 'an_incredible_big_email_that_is_bigger_than_77@wont.pass.the.email.validation.com';

    const ret = await sut.create(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(402);
  });

  test('should return 401 if user is already registered', async () => {
    const sut = new UserController();
    const user = { ...alreadyRegisteredUser };

    const ret = await sut.create(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(401);
  });

  test('should return 406 if UserModel returns a MockError', async () => {
    const mockUserModel: UserModel = new UserModel();
    mockUserModel.create = async (user: IUser): Promise<Return> => {
      return new Infra.Error('Mock error for create method on UserModel - ' + user.email, 406, 'MockError');
    };

    const sut = new UserController(mockUserModel);
    const user = { ...validUser };

    const ret = await sut.create(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(406);
    expect(ret.identifier).toBe('MockError');
  });

  test('should return 506 if UserModel returns a MockException', async () => {
    const mockUserModel: UserModel = new UserModel();
    mockUserModel.create = async (user: IUser): Promise<Return> => {
      return new Infra.Exception('Mock exception for create method on UserModel - ' + user.email, 506, 'MockException');
    };

    const sut = new UserController(mockUserModel);
    const user = { ...validUser };

    const ret = await sut.create(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(506);
    expect(ret.identifier).toBe('MockException');
  });

  test('should return 200 if user is successfully created', async () => {
    const sut = new UserController();
    const user = { ...validUser };

    const ret = await sut.create(user);
    expect(ret.ok).toBe(true);
    expect(ret.code).toBe(200);
    expect(ret.data).not.toBeUndefined();

    const getRecentlyCreatedUser = await sut.get({
      email: user.email
    });
    expect(getRecentlyCreatedUser.ok).toBe(true);
    expect(getRecentlyCreatedUser.code).toBe(201);
    expect(getRecentlyCreatedUser.data.name).toEqual(user.name);

    const removeUser = await sut.remove({
      email: user.email
    });
    expect(removeUser.ok).toBe(true);
  });
});

describe('User get tests', () => {
  beforeAll(async () => {
    if (!connection()) {
      return await createDBConn();
    }
  });

  test('should return 400 if email is not provided on get call', async () => {
    const sut = new UserController();
    const user = { };

    const ret = await sut.get(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(400);
    expect(ret.identifier).toEqual('RequiredField');
  });

  test('should return 500 if no request is provided on get call', async () => {
    const sut = new UserController();

    const ret = await sut.get(undefined);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(500);
    expect(ret.identifier).toEqual('RequiredFieldException');
  });

  test('should return 404 if user is not registered', async () => {
    const sut = new UserController();
    const user = { ...validUser };

    const ret = await sut.get(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(404);
    expect(ret.identifier).toEqual('InexistentEntry');
  });

  test('should return 200 if user returns ok', async () => {
    const sut = new UserController();
    const user = { ...alreadyRegisteredUser };

    const ret = await sut.get(user);
    expect(ret.ok).toBe(true);
    expect(ret.code).toBe(201);

    expect(ret.data).not.toBeUndefined();
    expect(ret.data.email).toEqual(user.email);
    expect(ret.data.password).toBeUndefined();
  });
});

describe('User remove tests', () => {
  beforeAll(async () => {
    if (!connection()) {
      return await createDBConn();
    }
  });

  test('should return 400 if email is not provided on remove call', async () => {
    const sut = new UserController();
    const user = { };

    const ret = await sut.remove(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(400);
    expect(ret.identifier).toEqual('RequiredField');
  });

  test('should return 500 if no request is provided on remove call', async () => {
    const sut = new UserController();

    const ret = await sut.remove(undefined);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(500);
    expect(ret.identifier).toEqual('RequiredFieldException');
  });

  test('should return 404 if user is not registered on remove', async () => {
    const sut = new UserController();
    const user = { ...validUser };

    const ret = await sut.remove(user);
    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(404);
    expect(ret.identifier).toEqual('InexistentEntry');
  });

  test('should return 200 if user remove returns ok', async () => {
    const sut: UserController = new UserController();
    const user = { ...alreadyRegisteredUser };

    const ret = await sut.remove(user);
    expect(ret.ok).toBe(true);
    expect(ret.code).toBe(200);

    const retRemovedUser = await sut.get(user);
    expect(retRemovedUser.ok).toBe(false);
    expect(retRemovedUser.identifier).toBe('InexistentEntry');

    const retCreateUserAgain = await sut.create(user);
    expect(retCreateUserAgain.ok).toBe(true);
  });
});
