import express from 'express';

const initExpressServer = () => {
  const app = express();
  app.use(express.json());

  require('../routes')(app);
  app.listen(3333);
};

export default initExpressServer;
