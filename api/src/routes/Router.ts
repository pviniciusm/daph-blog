import { ApiReturn, Return } from '../util/api';
import express from 'express';

class Router {
  protected router: express.Router;

  constructor() {
    this.router = express.Router();
  }

  protected route(data: any, res: any, method: any) {
    try {
      const ret: Return = method(data);
      return ret.ok ? ApiReturn.success(res, ret) : ApiReturn.failure(res, ret);
    } catch (error) {
      const messageError = error.toString();
      return ApiReturn.exception(res, messageError);
    }
  }

  getRoutes = () => {
    return this.router;
  };

  adapt = (req: any) => {
    return {
      body: req.body,
      header: req.header,
    };
  };

  protected post = (url: string, method: any) => {
    this.router.post(url, async (req, res) =>
      this.route(this.adapt(req), res, method)
    );
  };

  protected get = (url: string, method: any) => {
    this.router.get(url, async (req, res) =>
      this.route(this.adapt(req), res, method)
    );
  };
}

export default Router;
