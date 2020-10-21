import { createConnection } from 'typeorm';

const createDBCon = () => createConnection();
export default createDBCon;
