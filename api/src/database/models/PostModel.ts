import Infra, { Return, ToInterface } from '../../util';
import { EntityRepository, InsertResult, Like } from 'typeorm';
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
  async get (post: Partial<IPost>): Promise<Return> {
    try {
      const retPost = await this.repository.createQueryBuilder('post')
        .innerJoin('user', 'user', 'post.username = user.username')
        .select('user.username', 'username')
        .addSelect('post.post_id', 'postId')
        .addSelect('post.content', 'content')
        .addSelect('post.title', 'title')
        .addSelect('post.updatedAt', 'updatedAt')
        .addSelect('post.createdAt', 'createdAt')
        .addSelect('user.name', 'user.name')
        .where('post.post_id = :postId', { postId: post.postId })
        .andWhere('user.username = :username', { username: post.username })
        .getRawOne();

      if (!retPost) {
        return new Infra.InexistentEntryError('Post');
      }

      const obtainedPost = ToInterface<IPost>(retPost);

      return new Infra.Success(obtainedPost, 'Post was successfully obtained', 201);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async remove (post: Partial<IPost>): Promise<Return> {
    try {
      const retPost: Post = await this.repository.findOne({
        postId: post.postId
      });

      if (!retPost) {
        return new Infra.InexistentEntryError('Post');
      }

      const retRemove = await this.repository.delete({
        postId: post.postId,
        user: {
          username: post.username
        }
      });

      return new Infra.Success(retRemove, 'Post was successfully removed', 200);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async create (post: Partial<IPost>): Promise<Return> {
    try {
      const retSavedPost: InsertResult = await this.repository.insert({ ...post, user: { username: post.username } });
      const newPost = ToInterface<IPost>(retSavedPost.identifiers[0]);

      return new Infra.Success(newPost, 'Post successfuly created', 201);
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

      const retUpdate = await this.repository.update(findConditions, { content: post.content });
      return new Infra.Success(retUpdate);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }
}
