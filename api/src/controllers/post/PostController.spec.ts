import Infra, { Return } from '../../util';
import PostModel, { IPost } from '../../database/models/PostModel';
import { createConnection, getConnection } from '../../database';
import '../../util/helpers/matchers';
import UserController from '../user/User';
import { IUser } from '../../database/models/UserModel';

const validPost: IPost = {
  postId: 'post-id-nao-deve-ser-este',
  title: 'Primeiro post da daphne',
  username: 'daphne',
  content: 'Este é o post da Daphne! au au!!'
};

const alreadyRegisteredPost: IPost = {
  postId: 'titulo',
  title: 'Titulo',
  username: 'bruna',
  content: 'conteudo do post'
};

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

      let postId: string = title.replace(/\s+/g, '-').toLowerCase();

      const retCountPosts = await this.model.countIds(postId);
      if (!retCountPosts.ok) {
        return retCountPosts;
      }

      if (retCountPosts.data > 0) {
        postId += `-${retCountPosts.data}`;
      }

      post.postId = postId;

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

      return new Infra.Success(undefined);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  private postContentValidation = (content: string) : Return => {
    if (content.length > 300) {
      return new Infra.InvalidFieldError('Post content', 'must have less than 300 characters');
    }

    return new Infra.Success(null);
  };
}

describe('Post get tests', () => {
  beforeAll(async () => {
    if (!getConnection()) {
      await createConnection();
    }

    const bruna: IUser = {
      name: 'Bruna',
      lastName: 'Fonseca',
      email: 'bruna@teste.com',
      password: '123456',
      repeatPassword: '123456',
      username: 'bruna'
    };
    await new UserController().create(bruna);
  });

  test('should return 500 if no request is provided on get call', async () => {
    const sut = new PostController();

    const ret = await sut.get(undefined);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(500);
  });

  test('should return 400 if no postId is provided', async () => {
    const sut = new PostController();
    const post = { ...validPost };
    post.postId = undefined;

    const ret = await sut.get(post);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
    expect(ret.identifier).toMatch('RequiredField');
  });

  test('should return 400 if no username is provided', async () => {
    const sut = new PostController();
    const post = { ...validPost };
    post.username = undefined;

    const ret = await sut.get(post);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
    expect(ret.identifier).toMatch('RequiredField');
  });

  test('should return 404 if post does not exist', async () => {
    const sut = new PostController();
    const post = { ...validPost };

    const ret = await sut.get(post);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(404);
    expect(ret.identifier).toMatch('InexistentEntry');
  });

  test('should return 404 if user does not exist', async () => {
    const sut = new PostController();
    const post = { ...alreadyRegisteredPost };
    post.username = 'scooby dooby doo';

    const ret = await sut.get(post);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(404);
    expect(ret.identifier).toMatch('InexistentEntry');
  });

  test('should return 200 post get is successfull', async () => {
    const sut = new PostController();
    const post = { ...alreadyRegisteredPost };

    const ret = await sut.get(post);
    expect(ret).toReturnOk();
    expect(ret).toHaveValidCode(200);

    const retData: Partial<IPost> = ret.data;
    expect(retData.postId).not.toBeUndefined();
    expect(retData.username).not.toBeUndefined();
    expect(retData.user).not.toBeUndefined();
    expect(retData.user.name).not.toBeUndefined();
  });
});

describe('Post create tests', () => {
  beforeAll(async () => {
    if (!getConnection()) {
      await createConnection();
    }
  });

  test('create: should return 500 if no request is provided', async () => {
    const sut = new PostController();
    const ret = await sut.create(undefined);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(500);
  });

  test('create: should return 400 if no title is provided', async () => {
    const sut = new PostController();
    const post = { ...validPost };
    post.title = undefined;

    const ret = await sut.create(post);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
    expect(ret.identifier).toBe('RequiredField');
  });

  test('create: should return 400 if no content is provided', async () => {
    const sut = new PostController();
    const post = { ...validPost };
    post.content = undefined;

    const ret = await sut.create(post);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
    expect(ret.identifier).toBe('RequiredField');
  });

  test('create: should return 400 if no username is provided', async () => {
    const sut = new PostController();
    const post = { ...validPost };
    post.username = undefined;

    const ret = await sut.create(post);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
    expect(ret.identifier).toBe('RequiredField');
  });

  test('create: should return 404 if user does not exist', async () => {
    const sut = new PostController();
    const post = { ...validPost };
    post.username = 'inexistent_user';

    const ret = await sut.create(post);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(404);
    expect(ret.identifier).toBe('InexistentEntry');
  });

  test.skip('create: should return 200 if post create is successful', async () => {
    const sut = new PostController();
    const post = { ...validPost };

    const ret = await sut.create(post);

    expect(ret).toReturnOk();
    expect(ret).toHaveValidCode(200);
    expect(ret.data.postId).not.toBeUndefined();

    // tests if postId is replaced by a new one
    expect(ret.data.postId).not.toEqual(validPost.postId);
  });

  test('create: should return 402 if content length is invalid', async () => {
    const sut = new PostController();
    const post = { ...alreadyRegisteredPost };
    post.content = 'abc'.repeat(101);

    const ret = await sut.create(post);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(402);
    expect(ret.identifier).toBe('InvalidField');
  });
});

describe('Post delete tests', () => {
  beforeAll(async () => {
    if (!getConnection()) {
      await createConnection();
    }
  });

  test('delete: should return 500 if no request is provided', async () => {
    const sut = new PostController();
    const ret = await sut.delete(undefined);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(500);
  });

  test('delete: should return 400 if no postId is provided', async () => {
    const sut = new PostController();
    const post = { ...validPost };
    post.postId = undefined;

    const ret: Return = await sut.delete(post);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
    expect(ret.identifier).toBe('RequiredField');
  });

  test('delete: should return 400 if no username is provided', async () => {
    const sut = new PostController();
    const post = { ...validPost };
    post.username = undefined;

    const ret: Return = await sut.delete(post);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
    expect(ret.identifier).toBe('RequiredField');
  });

  test('delete: should return 404 if post does not exist', async () => {
    const sut = new PostController();
    const post = { ...validPost };
    post.postId = 'inexistent_post';

    const ret: Return = await sut.delete(post);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(404);
    expect(ret.identifier).toBe('InexistentEntry');
  });

  test('delete: should return 200 if post was successfully deleted', async () => {
    const sut = new PostController();
    const post = { ...validPost };
    post.title = 'Delete test';

    const retCreate = await sut.create(post);
    expect(retCreate).toReturnOk();
    expect(retCreate).toHaveValidCode(200);

    const createdPost: Partial<IPost> = retCreate.data;
    createdPost.username = createdPost.user.username;

    const ret: Return = await sut.delete(createdPost);
    expect(ret).toReturnOk();
    expect(ret).toHaveValidCode(200);

    const retGetPost = await sut.get(createdPost);
    expect(retGetPost).not.toReturnOk();
    expect(retGetPost).toHaveValidCode(404);
  });
});

describe('Post update tests', () => {
  beforeAll(async () => {
    if (!getConnection()) {
      await createConnection();
    }
  });

  test('update: should return 500 if no request is provided', async () => {
    const sut = new PostController();
    const ret = await sut.update(undefined);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(500);
  });

  test('update: should return 400 if any mandatory field is not provided', async () => {
    const sut = new PostController();
    const post = { ...validPost };

    // Username
    post.username = undefined;
    let ret = await sut.update(post);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
    expect(ret.identifier).toBe('RequiredField');

    // PostId
    post.username = 'any_username';
    post.postId = undefined;
    ret = await sut.update(post);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
    expect(ret.identifier).toBe('RequiredField');

    // Content
    post.postId = 'any_postId';
    post.content = undefined;
    ret = await sut.update(post);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
    expect(ret.identifier).toBe('RequiredField');
  });

  test('update: should return 404 if post does not exist', async () => {
    const sut = new PostController();
    const post = { ...validPost };

    const ret = await sut.update(post);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(404);
    expect(ret.identifier).toBe('InexistentEntry');
  });

  test('update: should return 400 if content length is invalid', async () => {
    const sut = new PostController();
    const post = { ...alreadyRegisteredPost };
    post.content = 'abc'.repeat(101);

    const ret = await sut.update(post);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(402);
    expect(ret.identifier).toBe('InvalidField');
  });
});
