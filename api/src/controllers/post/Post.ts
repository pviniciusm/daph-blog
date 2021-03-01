import Infra, { Return } from '../../util';
import PostModel, { IPost } from '../../database/models/PostModel';
import UserController from '../user/User';

class PostController {
  private model: PostModel;

  constructor (postModel?: PostModel) {
    this.model = postModel || new PostModel();
  }

  async get (post: Partial<IPost>): Promise<Return> {
    try {
      const { postId, username } = post;

      if (!postId) {
        return new Infra.RequiredFieldError('Post ID');
      }

      if (!username) {
        return new Infra.RequiredFieldError('Username');
      }

      const userController = new UserController();
      const retUser = await userController.get({ username });
      if (!retUser.ok) {
        retUser.message = `Error at getting user from post: ${retUser.message}`;
        return retUser;
      }

      const retPost = await this.model.get({ postId, username });
      if (!retPost.ok) {
        return retPost;
      }

      return new Infra.Success(retPost.data, 'Post get was successfull');
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async create (post: Partial<IPost>): Promise<Return> {
    try {
      if (!post) {
        return new Infra.RequiredFieldException('Post');
      }

      const { content, title, username } = post;
      if (!content) {
        return new Infra.RequiredFieldError('Content');
      }

      if (!title) {
        return new Infra.RequiredFieldError('Title');
      }

      if (!username) {
        return new Infra.RequiredFieldError('Username');
      }

      const retUser = await new UserController().get({ username });
      if (!retUser.ok) {
        retUser.message = 'Error at getting user: ' + retUser.message;
        return retUser;
      }

      // Content validation
      const retContentValidation = this.postContentValidation(content);
      if (!retContentValidation.ok) {
        return retContentValidation;
      }

      const retCreatePostId = await this.createPostId(title);
      if (!retCreatePostId.ok) {
        return retCreatePostId;
      }
      post.postId = retCreatePostId.data;

      const retCreatePost = await this.model.create(post);
      if (!retCreatePost.ok) {
        return retCreatePost;
      }

      return new Infra.Success(retCreatePost.data, 'Post was successfully created', 200);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async delete (post: Partial<IPost>): Promise<Return> {
    try {
      const { postId, username } = post;

      if (!postId) {
        return new Infra.RequiredFieldError('Post ID');
      }

      if (!username) {
        return new Infra.RequiredFieldError('Username');
      }

      const retPost = await this.get({ postId, username });
      if (!retPost.ok) {
        return retPost;
      }

      const retDelete = await this.model.remove(post);
      if (!retDelete.ok) {
        return retDelete;
      }

      return new Infra.Success(retDelete.data);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async update (post: Partial<IPost>): Promise<Return> {
    try {
      const { postId, username, content } = post;

      if (!postId) {
        return new Infra.RequiredFieldError('Post ID');
      }

      if (!username) {
        return new Infra.RequiredFieldError('Username');
      }

      if (!content) {
        return new Infra.RequiredFieldError('Post content');
      }

      const retPost = await this.get({ postId, username });
      if (!retPost.ok) {
        return retPost;
      }

      // Content validation
      const retContentValidation = this.postContentValidation(content);
      if (!retContentValidation.ok) {
        return retContentValidation;
      }

      const retUpdate = await this.model.update({
        postId,
        username,
        content
      });

      if (!retUpdate.ok) {
        return retUpdate;
      }

      return new Infra.Success(retUpdate.data);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  private postContentValidation = (content: string): Return => {
    if (content.length > 300) {
      return new Infra.InvalidFieldError('Post content', 'must have less than 300 characters');
    }

    return new Infra.Success(null);
  };

  private createPostId = async (title: string): Promise<Return> => {
    let postId: string = title.replace(/\s+/g, '-').toLowerCase();

    const retCountPosts = await this.model.countIds(postId);
    if (!retCountPosts.ok) {
      return retCountPosts;
    }

    if (retCountPosts.data > 0) {
      postId += `-${retCountPosts.data}`;
    }

    // post.postId = postId;
    return new Infra.Success(postId);
  }
}

export default PostController;
