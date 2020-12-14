import UserModel, { IUser } from '../../database/models/UserModel';
import createDBConn from '../../database/connection';
import connection from '../../database/getConnection';
import Infra, { Return } from '../../util';
import UserController from './User';
import '../../util/helpers/matchers';

const validUser: Partial<IUser> = {
  email: 'email@teste.com',
  password: '123456',
  username: 'teste',
  repeatPassword: '123456',
  name: 'Daphne',
  lastName: 'the Puppy'
};

const alreadyRegisteredUser: Partial<IUser> = {
  email: 'daphne@teste.com',
  password: '12345',
  username: 'daphne',
  repeatPassword: '12345',
  name: 'Daphne',
  lastName: 'the Puppy'
};

describe('User create tests', () => {
  beforeAll(async () => {
    if (!connection()) {
      await createDBConn();
    }

    const userController = new UserController();
    const retAlreadyCreated = await userController.get(alreadyRegisteredUser);
    if (!retAlreadyCreated.ok &&
      retAlreadyCreated.identifier === 'InexistentEntry') {
      await userController.create(alreadyRegisteredUser);
    }
  });

  test('should return 400 if no email is provided', async () => {
    const sut = new UserController();
    const ret: Return = await sut.create({
      password: 'any_password'
    });

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
  });

  test('should return 400 if no password is provided', async () => {
    const sut = new UserController();
    const ret: Return = await sut.create({
      email: 'any_email'
    });

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
  });

  test('should return 400 if no name is provided', async () => {
    const sut = new UserController();
    const ret: Return = await sut.create({
      email: 'any_email',
      password: 'any_password'
    });

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
  });

  test('should return 400 if no last_name is provided', async () => {
    const sut = new UserController();
    const ret: Return = await sut.create({
      email: 'any_email',
      password: 'any_password',
      name: 'daphne'
    });

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
  });

  test('should return 500 if no request is provided', async () => {
    const sut = new UserController();
    const ret: Return = await sut.create(undefined);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(500);
  });

  test('should return 402 if password has less than 5 characters', async () => {
    const sut = new UserController();
    const user = { ...validUser };
    user.password = '123';

    const ret = await sut.create(user);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(402);
  });

  test('should return 402 if password has more than 50 characters', async () => {
    const sut = new UserController();
    const user = { ...validUser };
    user.password = 'this password is too long so the create method must fail with 402';

    const ret = await sut.create(user);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(402);
  });

  test('should return 402 if password and repeat password are different', async () => {
    const sut = new UserController();
    const user = { ...validUser };
    user.repeatPassword = 'passwords dont match.';

    const ret = await sut.create(user);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(402);

    expect(ret.identifier).toBeDefined();
    expect(ret.identifier).toBe('InvalidField');
  });

  test('should return 402 if email has less than 5 characters', async () => {
    const sut = new UserController();
    const user = { ...validUser };
    user.email = 'e@ma';

    const ret = await sut.create(user);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(402);
  });

  test('should return 402 if email has more than 50 characters', async () => {
    const sut = new UserController();
    const user = { ...validUser };
    user.email = 'an_incredible_big_email_that_is_bigger_than_77@wont.pass.the.email.validation.com';

    const ret = await sut.create(user);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(402);
  });

  test('should return 401 if user is already registered', async () => {
    const sut = new UserController();
    const user = { ...alreadyRegisteredUser };

    const ret = await sut.create(user);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(401);
  });

  test('should return 406 if UserModel returns a MockError', async () => {
    const mockUserModel: UserModel = new UserModel();
    mockUserModel.create = async (user: IUser): Promise<Return> => {
      return new Infra.Error('Mock error for create method on UserModel - ' + user.email, 406, 'MockError');
    };

    const sut = new UserController(mockUserModel);
    const user = { ...validUser };

    const ret = await sut.create(user);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(406);
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
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(506);
    expect(ret.identifier).toBe('MockException');
  });

  test('should return 200 if user is successfully created', async () => {
    const sut = new UserController();
    const user = { ...validUser };

    const ret = await sut.create(user);
    expect(ret).toReturnOk();
    expect(ret).toHaveValidCode(200);
    expect(ret.data).not.toBeUndefined();

    const getRecentlyCreatedUser = await sut.get({
      email: user.email
    });
    expect(getRecentlyCreatedUser).toReturnOk();
    expect(getRecentlyCreatedUser.code).toBe(201);
    expect(getRecentlyCreatedUser.data.name).toEqual(user.name);

    const removeUser = await sut.remove({
      email: user.email
    });
    expect(removeUser).toReturnOk();
  });

  test('should return 400 if no username is provided', async () => {
    const sut = new UserController();
    const user = { ...alreadyRegisteredUser };
    user.username = undefined;

    const ret: Return = await sut.create(user);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
    expect(ret.identifier).toBe('RequiredField');
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
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
    expect(ret.identifier).toEqual('RequiredField');
  });

  test('should return 500 if no request is provided on get call', async () => {
    const sut = new UserController();

    const ret = await sut.get(undefined);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(500);
    expect(ret.identifier).toEqual('RequiredFieldException');
  });

  test('should return 404 if user is not registered', async () => {
    const sut = new UserController();
    const user = { ...validUser };

    const ret = await sut.get(user);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(404);
    expect(ret.identifier).toEqual('InexistentEntry');
  });

  test('should return 200 if user returns ok', async () => {
    const sut = new UserController();
    const user = { ...alreadyRegisteredUser };

    const ret = await sut.get(user);
    expect(ret).toReturnOk();
    expect(ret).toHaveValidCode(201);

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
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
    expect(ret.identifier).toEqual('RequiredField');
  });

  test('should return 500 if no request is provided on remove call', async () => {
    const sut = new UserController();

    const ret = await sut.remove(undefined);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(500);
    expect(ret.identifier).toEqual('RequiredFieldException');
  });

  test('should return 404 if user is not registered on remove', async () => {
    const sut = new UserController();
    const user = { ...validUser };

    const ret = await sut.remove(user);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(404);
    expect(ret.identifier).toEqual('InexistentEntry');
  });

  test('should return 200 if user remove returns ok', async () => {
    const sut: UserController = new UserController();
    const user = { ...alreadyRegisteredUser };

    const ret = await sut.remove(user);
    expect(ret).toReturnOk();
    expect(ret).toHaveValidCode(200);

    const retRemovedUser = await sut.get(user);
    expect(retRemovedUser).not.toReturnOk();
    expect(retRemovedUser.identifier).toBe('InexistentEntry');

    const retCreateUserAgain = await sut.create(user);
    expect(retCreateUserAgain).toReturnOk();
  });
});
