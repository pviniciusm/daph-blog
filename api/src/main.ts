import 'reflect-metadata';
import createDBConn from './database/connection';
import initExpressServer from './server/init';

createDBConn().then(initExpressServer);
