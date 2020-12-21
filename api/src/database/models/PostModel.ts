import Infra, { Return } from '../../util';
import { EntityRepository, Like } from 'typeorm';
import Database from '../Database';
import Post from '../entities/Post';
import { IUser } from './UserModel';

export interface IPost {
  postId: string,
  username: string,
  title: string,
  content: string,
  updatedAt?: Date,
  createdAt?: Date,
  user?: Partial<IUser>
}

@EntityRepository(Post)
export default class PostModel extends Database<Post> {
  constructor () {
    super('Post');
  }

  async get (post: Partial<IPost>): Promise<Return> {
    try {
      const query = this._selectQueryBuilder('post')
        .innerJoin('user', 'user', 'post.username = user.username')
        .select('user.username', 'username')
        .addSelect('post.post_id', 'postId')
        .addSelect('post.content', 'content')
        .addSelect('post.title', 'title')
        .addSelect('post.updatedAt', 'updatedAt')
        .addSelect('post.createdAt', 'createdAt')
        .addSelect('user.name', 'user.name')
        .where('post.post_id = :postId', { postId: post.postId })
        .andWhere('user.username = :username', { username: post.username });

      return await this._get(query);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async remove (post: Partial<IPost>): Promise<Return> {
    try {
      return await this._delete({
        postId: post.postId,
        user: {
          username: post.username
        }
      });
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async create (post: Partial<IPost>): Promise<Return> {
    try {
      return await this._create({ ...post, user: { username: post.username } });
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async countIds (postId: string): Promise<Return> {
    try {
      const count = await this.repository.count({
        postId: Like(`${postId}%`)
      });

      return new Infra.Success(count || 0);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async update (post: Partial<IPost>): Promise<Return> {
    try {
      const findConditions = {
        postId: post.postId,
        user: {
          username: post.username
        }
      };

      return this._update(findConditions, { content: post.content });
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }
}
