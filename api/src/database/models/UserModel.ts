import Infra, { Return } from '../../util';
import { EntityRepository } from 'typeorm';
import Database from '../Database';
import User from '../entities/User';

export interface IUser {
  email: string,
  username: string,
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
      let input = {};
      if (user.email) {
        input = { email: user.email };
      } else {
        input = { username: user.username };
      }

      const retUser: User = await this.repository.findOne(input);

      if (!retUser) {
        return new Infra.InexistentEntryError('User');
      }

      const obtainedUser : Partial<IUser> = retUser;
      return new Infra.Success(obtainedUser, 'User was successfully obtained', 201);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async getPassword (user: Partial<IUser>): Promise<Return> {
    try {
      const retUser: User = await this.repository.createQueryBuilder('user')
        .select(['user.email', 'user.password'])
        .where('user.email = :email', { email: user.email })
        .getOne();

      if (!retUser) {
        return new Infra.InexistentEntryError('User');
      }

      const obtainedUser : Partial<IUser> = retUser;
      return new Infra.Success(obtainedUser, 'User was successfully obtained', 201);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async remove (user: Partial<IUser>): Promise<Return> {
    try {
      const retUser: User = await this.repository.findOne({
        email: user.email
      });

      if (!retUser) {
        return new Infra.InexistentEntryError('User');
      }

      const retRemove = await this.repository.remove([retUser]);
      if (retRemove.length > 0) {
        return new Infra.Success(retRemove, 'User was successfully removed', 200);
      }

      return new Infra.RemoveError('user');
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async create (user: IUser): Promise<Return> {
    try {
      await this.repository.create(user);
      const retSavedUser: User = await this.repository.save(user);
      return new Infra.Success(retSavedUser, 'User successfuly created', 201);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }
}
