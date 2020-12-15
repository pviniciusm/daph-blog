import UserRoutes from './UserRouter';

module.exports = (app: any) => {
  app.use('/', new UserRoutes().getRoutes());
};
