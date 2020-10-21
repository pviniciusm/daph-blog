import express from 'express';
import 'reflect-metadata';
import createDBConn from './database/connection';

const initExpressServer = () => {
  const app = express();
  app.use(express.json());

  require('./routes')(app);
  app.listen(3333);
};

createDBConn().then(initExpressServer);
