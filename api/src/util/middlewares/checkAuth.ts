import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ApiReturn } from '../api';
import Infra from '..';
require('dotenv-safe').config();

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = <string> req.headers.auth;
  let data;

  try {
    data = <any> jwt.verify(token, process.env.SECRET);
    res.locals.data = data;
  } catch (error) {
    ApiReturn.exception(res, new Infra.Exception('Unauthorized token'), 500);
    return;
  }

  const { email } = data;
  const newToken = jwt.sign({ email }, process.env.SECRET, {
    expiresIn: '1h'
  });
  res.setHeader('token', newToken);

  next();
};
