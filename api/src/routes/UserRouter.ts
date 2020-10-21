import User from '../database/entities/User';
import { Connection, getConnection, getRepository } from 'typeorm';
import Infra from '../util';
import Router from './Router';

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

    const userRepo = getRepository(User);
    const users = await userRepo.find();

    return new Infra.Success(
      {
        users,
        connection: {
          isConnected: isconn, name: conn.name
        }
      },
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
