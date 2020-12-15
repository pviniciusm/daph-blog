import Router, { ParameterType } from './Router';
import UserController from '../controllers/user/User';
import { checkAuth } from '../util/middlewares/checkAuth';

class UserRouter extends Router {
  constructor () {
    super(new UserController());

    // GET
    this.get('/:email', UserController.prototype.get, ParameterType.Params, [checkAuth]);
    this.get('/:email/delete', UserController.prototype.remove, ParameterType.Params);
  }
}

export default UserRouter;
