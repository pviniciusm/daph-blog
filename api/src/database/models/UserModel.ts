import Infra, { Return } from '../../util';
import { EntityRepository } from 'typeorm';
import Database from '../Database';
import User from '../entities/User';

export interface IUser {
  email: string,
  password: string,
  repeatPassword?: string,
  name: string,
  lastName: string,
  updatedAt?: Date,
  createdAt?: Date
}

@EntityRepository(User)
export default class UserModel extends Database<User> {
  async findAndCount (args: any) {
    return await this.repository.findAndCount(args);
  }

  async get (user: Partial<IUser>): Promise<Return> {
    try {
      const retUser: User = await this.repository.findOne({
        email: user.email
      });

      if (!retUser) {
        return new Infra.InexistentEntryError('User');
      }

      const retretUser : Partial<IUser> = retUser;
      return new Infra.Success(retretUser);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }
}
