import { Return } from '../util/api';
import Router from './Router';

class UserController {
  create() {
    try {
      let a = 1;
      a = a * 2;

      return new Return().success({ data: a });
    } catch (e) {
      return new Return().exception();
    }
  }

  getUser() {
    return new Return().success(
      {
        user: {
          name: 'daphne',
          email: 'daphne@au.au.com',
          password: '126435',
        },
      },
      'Operacao realizada com sucesso.'
    );
  }
}

class UserRouter extends Router {
  constructor() {
    super();
    const controller = new UserController();

    // POSTs
    this.get('/', controller.getUser);
    this.get('/create', controller.create);
  }
}

export default UserRouter;
