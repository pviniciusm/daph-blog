import Router from './Router';
import UserController from '../controllers/user/User';

class UserRouter extends Router {
  constructor () {
    super();
    const controller = new UserController();

    // GET
    this.get('/u/:email', controller.getUser);
    this.post('/u/create', controller.create);
  }
}

export default UserRouter;
