import Infra, { Return } from '../../util';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn, EntityRepository } from 'typeorm';
import Database from '../Database';

export interface IUser {
  email: string,
  password: string,
  repeatPassword: string,
  name: string,
  lastName: string,
  updatedAt: Date,
  createdAt: Date
}

@Entity()
export default class User {
  @PrimaryColumn({
    type: 'varchar',
    length: 77
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 50,
    select: false
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 50
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 50
  })
  lastName: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  constructor (args?: Partial<IUser>) {
    if (args) Object.assign(this, args);
  }
}

@EntityRepository(User)
export class UserModel extends Database<User> {
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
