import Infra from '../../util';
import PostModel, { IPost } from '../../database/models/PostModel';
import { createConnection, getConnection } from '../../database';
import '../../util/helpers/matchers';
import UserController from '../user/User';

const validPost: IPost = {
  postId: 'novo-post',
  username: 'daphne',
  content: 'Este é o post da Daphne! au au!!'
};

const alreadyRegisteredPost: IPost = {
  postId: 'titulo',
  username: 'bruna',
  content: 'conteudo do post'
};

class PostController {
  private model: PostModel;

  constructor (postModel?: PostModel) {
    this.model = postModel || new PostModel();
  }

  async get (post: Partial<IPost>) {
    try {
      const { postId, username } = post;

      if (!postId) {
        return new Infra.RequiredFieldError('Post ID');
      }

      if (!username) {
        return new Infra.RequiredFieldError('Username');
      }

      const retPost = await this.model.get({ postId });
      if (!retPost.ok) {
        return retPost;
      }

      const userController = new UserController();
      const retUser = await userController.get({ username });
      if (!retUser.ok) {
        retUser.message = `Error at getting user from post: ${retUser.message}`;
        return retUser;
      }

      const postData: Partial<IPost> = retPost.data;
      if (username !== postData.username) {
        return new Infra.WrongInformationError('Username');
      }

      return new Infra.Success(retPost.data, 'Post get was successfull');
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }
}

/*
Testes a serem feitos:
1) get
  - Se informou id
  - se informou username
  - se o id existe na base
  - se o user existe na base
  - se o user é o mesmo cadastrado do post
  - retorna dados do post + nome do user
*/

describe('Post get tests', () => {
  beforeAll(async () => {
    if (!getConnection()) {
      await createConnection();
    }
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

  test('should return 402 if user does not match the post user', async () => {
    const sut = new PostController();
    const post = { ...alreadyRegisteredPost };
    post.username = 'daphne';

    const ret = await sut.get(post);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(402);
    expect(ret.identifier).toMatch('WrongInfo');
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
