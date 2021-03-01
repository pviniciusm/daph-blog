import Infra, { Return } from '../../util';
import { EntityRepository } from 'typeorm';
import Database from '../Database';
import Follow from '../entities/Follow';
import { IUser } from './UserModel';

export interface IFollow {
  senderUsername: string,
  receiverUsername: string,
  updatedAt?: Date,
  createdAt?: Date,
  isPending?: Boolean,
  title?: String,
  senderUser?: Partial<IUser>
  receiverUser?: Partial<IUser>
}

@EntityRepository(Follow)
export default class FollowModel extends Database<Follow> {
  constructor () {
    super('Follow');
  }

  async get (follow: Partial<IFollow>): Promise<Return> {
    try {
      const query = this._selectQueryBuilder('follow')
        .innerJoin('user', 's_user', 'follow.sender_username = s_user.username')
        .innerJoin('user', 'r_user', 'follow.receiver_username = r_user.username')
        .addSelect('follow.sender_username', 'sender_username')
        .addSelect('follow.receiver_username', 'receiver_username')
        .addSelect('follow.updatedAt', 'updatedAt')
        .addSelect('follow.createdAt', 'createdAt')
        .addSelect('s_user.name', 'senderUser.name')
        .addSelect('r_user.name', 'receiverUser.name')
        .where('follow.sender_username = :senderUsername', { senderUsername: follow.senderUsername })
        .andWhere('follow.receiver_username = :receiverUsername', { receiverUsername: follow.receiverUsername });

      return await this._get(query);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async remove (follow: Partial<IFollow>): Promise<Return> {
    try {
      return await this._delete({
        senderUser: {
          username: follow.senderUsername
        },
        receiverUser: {
          username: follow.receiverUsername
        }
      });
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async create (follow: Partial<IFollow>): Promise<Return> {
    try {
      return await this._create({
        ...follow,
        senderUser: { username: follow.senderUsername },
        receiverUser: { username: follow.receiverUsername }
      });
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async count (follow: Partial<IFollow>): Promise<Return> {
    try {
      const count = await this.repository.count({
        senderUser: {
          username: follow.senderUsername
        },
        receiverUser: {
          username: follow.receiverUsername
        }
      });

      return new Infra.Success(count || 0);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async update (follow: Partial<IFollow>): Promise<Return> {
    try {
      const findConditions = {
        senderUser: {
          username: follow.senderUsername
        },
        receiverUser: {
          username: follow.receiverUsername
        }
      };

      return this._update(findConditions, { isPending: follow.isPending });
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }
}
