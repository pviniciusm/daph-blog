import Router, { ParameterType } from './Router';
import UserController from '../controllers/user/User';

class UserRouter extends Router {
  constructor () {
    super(new UserController());

    // GET
    this.get('/u/:email', UserController.prototype.get, ParameterType.Params);
    this.get('/user', UserController.prototype.get, ParameterType.Query);
  }
}

export default UserRouter;
