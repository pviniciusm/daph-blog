import { Connection, getConnection } from 'typeorm';
import Infra from '../util';
import Router from './Router';
import User, { UserModel } from '../database/entities/User';

class UserController {
  create () {
    try {
      let a = 1;
      a = a * 2;

      return new Infra.Success({ data: { a } });
    } catch (e) {
      return new Infra.Exception(e.toString());
    }
  }

  async getUser () {
    const conn:Connection = getConnection();
    const isconn = conn.isConnected;

    if (!isconn) {
      return new Infra.Error('Database is not connected', 500);
    }

    const someUser = new User({});
    someUser.email = 'daphne@teste.com';

    const dbUser = new UserModel();
    // const userIn: Partial<IUser> = {
    //   email: 'daphne@teste.com'
    // };

    const retUser = await dbUser.get({
      email: 'daphn2e@teste.com'
    });

    if (!retUser.ok) {
      return retUser;
    }

    return new Infra.Success(
      retUser.data,
      'Operacao realizada com sucesso.'
    );
  }
}

class UserRouter extends Router {
  constructor () {
    super();
    const controller = new UserController();

    // POSTs
    this.get('/us', controller.getUser);
    this.get('/create', controller.create);
  }
}

export default UserRouter;
