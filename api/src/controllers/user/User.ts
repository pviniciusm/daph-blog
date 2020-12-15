import UserModel, { IUser } from '../../database/models/UserModel';
import Infra, { Return } from '../../util';
import bcryptjs from 'bcryptjs';

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

      const { email, username, password, repeatPassword, name, lastName } = request;

      if (!email) {
        return new Infra.RequiredFieldError('E-mail');
      }

      if (!username) {
        return new Infra.RequiredFieldError('Username');
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
        username,
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

      const { email, username } = request;

      if (!email && !username) {
        return new Infra.RequiredFieldError('E-mail/username');
      }

      return await this.model.get({ email, username });
    } catch (err) {
      return new Infra.Exception(err.toString(), 500);
    }
  }

  async getPassword (request: Partial<IUser>): Promise<Return> {
    try {
      if (!request) {
        return new Infra.RequiredFieldException('Request');
      }

      const { email } = request;

      if (!email) {
        return new Infra.RequiredFieldError('E-mail');
      }

      return await this.model.getPassword({ email });
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

export default UserController;
