import { Return } from '../../util';
import connection from '../../database/getConnection';
import createDBConn from '../../database/connection';
import { IUser } from '../../database/models/UserModel';
import LoginController from './Auth';
import UserController from '../user/User';
import '../../util/helpers/matchers';

const validUser: Partial<IUser> = {
  email: 'email@teste.com',
  username: 'teste',
  password: '123456',
  repeatPassword: '123456',
  name: 'Daphne',
  lastName: 'the Puppy'
};

const alreadyRegisteredUser: Partial<IUser> = {
  email: 'daphne@teste.com',
  username: 'daphne',
  password: '12345',
  repeatPassword: '12345',
  name: 'Daphne',
  lastName: 'the Puppy'
};

describe.skip('Login tests', () => {
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

  test('should return 400 if no email is provided on login call', async () => {
    const sut = new LoginController();
    const ret: Return = await sut.login({
      password: 'any_password'
    });

    expect(ret).not.toReturnOk();
    expect(ret.code).toBe(400);
  });

  test('should return 400 if no password is provided on login call', async () => {
    const sut = new LoginController();
    const ret: Return = await sut.login({
      email: 'any_email'
    });

    expect(ret).not.toReturnOk();
    expect(ret.code).toBe(400);
  });

  test('should return 500 if no request is provided on login call', async () => {
    const sut = new LoginController();
    const ret = await sut.login(undefined);

    expect(ret).not.toReturnOk();
    expect(ret.code).toBe(500);
  });

  test('should return 404 if user does not exist', async () => {
    const sut = new LoginController();
    const user = { ...validUser };
    user.password = 'invalid _email';

    const ret = await sut.login(user);

    expect(ret).not.toReturnOk();
    expect(ret.code).toBe(404);
    expect(ret.identifier).toBe('InexistentEntry');
  });

  test('should return 401 if password is incorrect', async () => {
    const sut = new LoginController();
    const user = { ...alreadyRegisteredUser };
    user.password = 'incorrect_password';

    const ret = await sut.login(user);

    expect(ret).not.toReturnOk();
    expect(ret.code).toBe(402);
    expect(ret.identifier).toBe('IncorrectPassword');
  });

  test('should return 200 with access token if login is valid', async () => {
    const sut = new LoginController();
    const user = { ...alreadyRegisteredUser };

    const ret = await sut.login(user);

    expect(ret).toReturnOk();
    expect(ret.code).toBe(200);
    expect(ret.data).not.toBeUndefined();

    expect(ret.data.token).not.toBeUndefined();
  });
});
