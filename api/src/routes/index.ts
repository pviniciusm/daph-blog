import UserRoutes from './UserRouter';

module.exports = (app: any) => {
  app.use('/user', new UserRoutes().getRoutes());
};
