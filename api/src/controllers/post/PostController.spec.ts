import { Return } from '../../util';
import { IPost } from '../../database/models/PostModel';
import { createConnection, getConnection } from '../../database';
import UserController from '../user/User';
import { IUser } from '../../database/models/UserModel';
import '../../util/helpers/matchers';
import PostController from './Post';

// Auxiliary function to create a random uuid string
function uuidv4 () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0; const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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

describe.skip('Post get tests', () => {
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

    await new PostController().create(alreadyRegisteredPost);
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

describe.skip('Post create tests', () => {
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

describe.skip('Post delete tests', () => {
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

describe.skip('Post update tests', () => {
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

    await new PostController().create(alreadyRegisteredPost);
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

  test('update: should return 200 if update is successfull', async () => {
    const sut = new PostController();
    const post = { ...alreadyRegisteredPost };

    const newContent = uuidv4();
    post.content = newContent;

    const ret = await sut.update(post);
    expect(ret).toReturnOk();
    expect(ret).toHaveValidCode(200);

    const retPost = await sut.get(post);
    expect(retPost).toReturnOk();
    expect(retPost).toHaveValidCode(200);
    expect(retPost.data).not.toBeUndefined();
    const basePost: Partial<IPost> = retPost.data;

    expect(basePost.content).toEqual(newContent);
  });
});
