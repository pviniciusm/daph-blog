import Infra, { Return } from '../../util';
import UserController from '../user/User';
import connection from '../../database/getConnection';
import createDBConn from '../../database/connection';
import { IUser } from '../../database/models/UserModel';
import bcryptjs from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
require('dotenv-safe').config();

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

class LoginController {
  private userController: UserController;

  constructor () {
    this.userController = new UserController();
  }

  async login (request: any): Promise<Return> {
    if (!request) {
      return new Infra.RequiredFieldException('Request');
    }

    if (!request.email) {
      return new Infra.RequiredFieldError('E-mail');
    }

    if (!request.password) {
      return new Infra.RequiredFieldError('Password');
    }

    // Get user from database
    const retUser = await this.userController.getPassword(request);
    if (!retUser.ok) {
      return retUser;
    }

    // Check if passwords match
    const baseUser: IUser = retUser.data;
    if (!bcryptjs.compareSync(request.password, baseUser.password)) {
      return new Infra.IncorrectPassword();
    }

    // Get user data to return
    const userToReturn = await this.userController.get(request);
    if (!userToReturn.ok) {
      return userToReturn;
    }

    // Create access token
    const token = jwt.sign(
      { email: baseUser.email },
      process.env.SECRET,
      { expiresIn: '1h' }
    );

    return new Infra.Success({ ...userToReturn, token: token }, 'Operação realizada com sucesso');
  }
}

describe('Login tests', () => {
  beforeAll(async () => {
    if (!connection()) {
      return await createDBConn();
    }
  });

  test('should return 400 if no email is provided on login call', async () => {
    const sut = new LoginController();
    const ret: Return = await sut.login({
      password: 'any_password'
    });

    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(400);
  });

  test('should return 400 if no password is provided on login call', async () => {
    const sut = new LoginController();
    const ret: Return = await sut.login({
      email: 'any_email'
    });

    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(400);
  });

  test('should return 500 if no request is provided on login call', async () => {
    const sut = new LoginController();
    const ret = await sut.login(undefined);

    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(500);
  });

  test('should return 404 if user does not exist', async () => {
    const sut = new LoginController();
    const user = { ...validUser };
    user.password = 'invalid_email';

    const ret = await sut.login(user);

    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(404);
    expect(ret.identifier).toBe('InexistentEntry');
  });

  test('should return 401 if password is incorrect', async () => {
    const sut = new LoginController();
    const user = { ...alreadyRegisteredUser };
    user.password = 'incorrect_password';

    const ret = await sut.login(user);

    expect(ret.ok).toBe(false);
    expect(ret.code).toBe(402);
    expect(ret.identifier).toBe('IncorrectPassword');
  });

  test('should return 200 with access token if login is valid', async () => {
    const sut = new LoginController();
    const user = { ...alreadyRegisteredUser };

    const ret = await sut.login(user);

    expect(ret.ok).toBe(true);
    expect(ret.code).toBe(200);
    expect(ret.data).not.toBeUndefined();

    expect(ret.data.token).not.toBeUndefined();
  });
});
