import { ApiReturn } from '../util/api';
import Infra, { Return } from '../util';
import express, { Request } from 'express';

export enum ParameterType {
  Body = 1,
  Query,
  Params
};

class Router {
  protected router: express.Router;
  private instance: any;

  constructor (instance: any) {
    this.router = express.Router();
    this.instance = instance;
  }

  protected async route (data: any, res: any, method: any) {
    try {
      const ret: Return = await method.call(this.instance, data);

      return ret.ok
        ? ApiReturn.success(res, ret)
        : ApiReturn.failure(res, ret);
    } catch (error) {
      const messageError = error.toString();
      return ApiReturn.exception(res, new Infra.Exception(messageError));
    }
  }

  getRoutes = () => {
    return this.router;
  };

  adapt = (req: Request, parameter?: ParameterType) => {
    switch (parameter) {
      case ParameterType.Query:
        return req.query;
      case ParameterType.Params:
        return req.params;
      default:
        return req.body;
    }
  };

  protected post = (url: string, method: any, parameter?: ParameterType) => {
    this.router.post(url, async (req, res) => {
      await this.route(
        this.adapt(req, parameter),
        res,
        method);
    });
  };

  protected get = (url: string, method: any, parameter?: ParameterType) => {
    this.router.get(url, async (req, res) => {
      await this.route(
        this.adapt(req, parameter),
        res,
        method);
    });
  };
}

export default Router;
