import Infra, { Return } from '../../util';
import FollowModel, { IFollow } from '../../database/models/FollowModel';
import { createConnection, getConnection } from '../../database';
import '../../util/helpers/matchers';
import UserController from '../user/User';
import { IUser } from '../../database/models/UserModel';

const validFollow: IFollow = {
  senderUsername: 'daphne_2',
  receiverUsername: 'toby_2',
  title: 'Hey Toby, can I follow you?',
  senderUser: {
    username: 'daphne_2'
  },
  receiverUser: {
    username: 'toby_2'
  }
};

const toCreateFollow: IFollow = {
  senderUsername: 'daphne',
  receiverUsername: 'toby',
  title: 'Hey Toby, can I follow you again?',
  senderUser: {
    username: 'daphne'
  },
  receiverUser: {
    username: 'toby'
  }
};

const toby: Partial<IUser> = {
  username: 'toby'
};

const daphne: Partial<IUser> = {
  username: 'daphne'
};

class FollowController {
  private model: FollowModel;

  constructor (followModel?: FollowModel) {
    this.model = followModel || new FollowModel();
  }

  async get (follow: Partial<IFollow>): Promise<Return> {
    try {
      if (!follow) {
        return new Infra.RequiredFieldException('Follow');
      }

      const { senderUsername, receiverUsername } = follow;

      if (!senderUsername) {
        return new Infra.RequiredFieldError('Sender username two');
      }

      if (!receiverUsername) {
        return new Infra.RequiredFieldError('Receiver username');
      }

      const retFollow = await this.model.get({
        senderUsername,
        receiverUsername
      });

      if (!retFollow.ok) {
        return retFollow;
      }

      return new Infra.Success('any_data');
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  async follow (follow: Partial<IFollow>): Promise<Return> {
    try {
      if (!follow) {
        return new Infra.RequiredFieldException('User');
      }
      if (!follow.senderUser) {
        return new Infra.RequiredFieldException('User');
      }
      if (!follow.receiverUser) {
        return new Infra.RequiredFieldException('Receiver User');
      }

      const senderUsername = follow.senderUser.username;
      const receiverUsername = follow.receiverUser.username;

      if (!senderUsername) {
        return new Infra.RequiredFieldError('Sender username ONE');
      }

      if (!receiverUsername) {
        return new Infra.RequiredFieldError('Receiver username');
      }

      // Check if follow already exists
      const retFollow = await this.get({
        senderUsername,
        receiverUsername
      });

      if (retFollow.ok) {
        return retFollow;
      }

      // Check if user exists
      const userController = new UserController();
      let retUser = await userController.get({ username: senderUsername });
      if (!retUser.ok) {
        if (retUser.code === 404) {
          return new Infra.InexistentEntryError('User');
        }

        return retUser;
      }

      // Check if receiver user exists
      retUser = await userController.get({ username: receiverUsername });
      if (!retUser.ok) {
        if (retUser.code === 404) {
          return new Infra.InexistentEntryError('Receiver User');
        }

        return retUser;
      }

      // Save the follow request
      return await this.model.create({
        ...follow,
        senderUsername,
        receiverUsername,
        isPending: false
      });
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }
}

describe.skip('Follow get tests', () => {
  beforeAll(async () => {
    if (!getConnection()) {
      await createConnection();
    }
  });

  test('get: should return 500 if no request is provided', async () => {
    const sut = new FollowController();
    const ret = await sut.get(undefined);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(500);
  });

  test('should return 400 if no senderUsername is provided', async () => {
    const sut = new FollowController();
    const follow = { ...validFollow };

    follow.senderUsername = undefined;
    const ret = await sut.get(follow);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
    expect(ret.identifier).toBe('RequiredField');
  });

  test('should return 400 if no receiverUsername is provided', async () => {
    const sut = new FollowController();
    const follow = { ...validFollow };

    follow.receiverUsername = undefined;
    const ret = await sut.get(follow);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
    expect(ret.identifier).toBe('RequiredField');
  });

  test('should return 404 if no follow does not exist', async () => {
    const sut = new FollowController();
    const follow = { ...validFollow };

    const ret = await sut.get(follow);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(404);
    expect(ret.identifier).toBe('InexistentEntry');
  });

  test('should return 200 if request is successfull', async () => {
    const sut = new FollowController();
    const follow = { ...validFollow };

    const ret = await sut.get(follow);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(200);
    expect(ret.data).not.toBeUndefined();
  });
});

describe.skip('Follow tests', () => {
  beforeAll(async () => {
    if (!getConnection()) {
      await createConnection();
    }

    const userController = new UserController();
    userController.create({ username: 'daphne', name: 'Daphne', lastName: 'The Puppy', email: 'daphne@teste.com', password: '12345', repeatPassword: '12345' });
    userController.create({ username: 'toby', name: 'Toby', lastName: 'The Dog', email: 'toby@teste.com', password: '123456', repeatPassword: '123456' });
  });

  test('follow: should return 500 if no request is provided', async () => {
    const sut = new FollowController();
    let ret = await sut.follow(undefined);
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(500);

    ret = await sut.follow({});
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(500);

    ret = await sut.follow({ senderUser: {} });
    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(500);
  });

  test('follow: should return 400 if no senderUsername is provided', async () => {
    const sut = new FollowController();
    const follow = { ...validFollow };
    follow.senderUser = { ...validFollow.senderUser };
    follow.receiverUser = { ...validFollow.receiverUser };

    follow.senderUser.username = undefined;
    const ret = await sut.follow(follow);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
    expect(ret.identifier).toBe('RequiredField');
  });

  test('follow: should return 400 if no receiverUsername is provided', async () => {
    const sut = new FollowController();
    const follow = { ...validFollow };
    follow.senderUser = { ...validFollow.senderUser };
    follow.receiverUser = { ...validFollow.receiverUser };

    follow.receiverUser.username = undefined;
    const ret = await sut.follow(follow);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(400);
    expect(ret.identifier).toBe('RequiredField');
  });

  test('follow: should return 404 if user does not exist', async () => {
    const sut = new FollowController();
    const follow = { ...validFollow };
    follow.senderUser = { ...validFollow.senderUser };
    follow.receiverUser = { ...validFollow.receiverUser };

    const ret = await sut.follow(follow);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(404);
    expect(ret.identifier).toBe('InexistentEntry');
  });

  test('follow: should return 404 if receiver user does not exist', async () => {
    const sut = new FollowController();
    const follow = { ...validFollow };
    follow.senderUser = { ...validFollow.senderUser };
    follow.receiverUser = { ...validFollow.receiverUser };

    follow.senderUser = { username: 'daphne' };
    const ret = await sut.follow(follow);

    expect(ret).not.toReturnOk();
    expect(ret).toHaveValidCode(404);
    expect(ret.identifier).toBe('InexistentEntry');
  });

  test('follow: should return 200 if follow is completed', async () => {
    const sut = new FollowController();
    const follow = { ...toCreateFollow };
    follow.receiverUser = daphne;
    follow.senderUser = toby;

    const ret = await sut.follow(follow);

    expect(ret).toReturnOk();
    expect(ret).toHaveValidCode(200);
    expect(ret.data).not.toBeUndefined();
  });

  test('follow: should return 200 if follow already exists', async () => {
    const sut = new FollowController();
    const follow = { ...toCreateFollow };
    follow.receiverUser = daphne;
    follow.senderUser = toby;

    // First following action
    let ret = await sut.follow(follow);
    expect(ret).toReturnOk();
    expect(ret).toHaveValidCode(200);
    expect(ret.data).not.toBeUndefined();

    // Second following action (same actors)
    ret = await sut.follow(follow);
    expect(ret).toReturnOk();
    expect(ret).toHaveValidCode(200);
    expect(ret.data).not.toBeUndefined();
  });
});
