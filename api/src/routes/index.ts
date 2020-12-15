import LoginRouter from './LoginRouter';
import UserRoutes from './UserRouter';

module.exports = (app: any) => {
  app.use('/u', new UserRoutes().getRoutes());
  app.use('/auth', new LoginRouter().getRoutes());
};
