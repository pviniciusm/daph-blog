import Router, { ParameterType } from './Router';
import LoginController from '../controllers/auth/Auth';

class LoginRouter extends Router {
  constructor () {
    super(new LoginController());

    // GET
    this.get('/login', LoginController.prototype.login, ParameterType.Body);
    // this.get('/logout', LoginController.prototype.logout, ParameterType.Query);
  }
}

export default LoginRouter;
