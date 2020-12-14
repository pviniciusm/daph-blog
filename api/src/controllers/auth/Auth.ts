import Infra, { Return } from '../../util';
import UserController from '../user/User';
import bcryptjs from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { IUser } from '../../database/models/UserModel';
require('dotenv-safe').config();

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

export default LoginController;
