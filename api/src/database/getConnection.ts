import { getConnection } from 'typeorm';

const connection = () => {
  var conn;
  try {
    const dbConnection = getConnection();
    if (dbConnection && dbConnection.isConnected) {
      return dbConnection;
    }

    return undefined;
  } catch {
    return conn;
  }
};

export default connection;
