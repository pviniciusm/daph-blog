import Infra, { Return, ToInterface } from '../../util';
import { EntityRepository } from 'typeorm';
import Database from '../Database';
import Post from '../entities/Post';
import { IUser } from './UserModel';

export interface IPost {
  postId: string,
  username: string,
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
        .innerJoin('user', 'user')
        .select('user.username', 'username')
        .addSelect('post.post_id', 'postId')
        .addSelect('post.content', 'content')
        .addSelect('post.updatedAt', 'updatedAt')
        .addSelect('post.createdAt', 'createdAt')
        .addSelect('user.name', 'user.name')
        .where('post.post_id = :postId', { postId: post.postId })
        .getRawOne();

      if (!retPost) {
        return new Infra.InexistentEntryError('Post');
      }

      // const obtainedPost: Partial<IPost> = Object
      //   .keys(retPost)
      //   .sort()
      //   .reduce((o, k) => _.set(o, k, retPost[k]), {});

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

      const retRemove = await this.repository.remove([retPost]);
      if (retRemove.length > 0) {
        return new Infra.Success(retRemove, 'Post was successfully removed', 200);
      }

      return new Infra.RemoveError('post');
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async create (post: IPost): Promise<Return> {
    try {
      await this.repository.create(post);
      const retSavedPost: Post = await this.repository.save(post);
      return new Infra.Success(retSavedPost, 'Post successfuly created', 201);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  // async update (post: IPost): Promise<Return> {
  //   try {
  //     const retSavedPost: Post = await this.repository.update(post);
  //     return new Infra.Success(retSavedPost, 'Post successfuly updated', 201);
  //   } catch (ex) {
  //     return new Infra.Exception(ex.toString());
  //   }
  // }
}
