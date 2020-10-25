import { AbstractRepository, getManager } from 'typeorm';

abstract class Database<T> extends AbstractRepository<T> {
  constructor () {
    super();
    this.manager = getManager();
  }
}

export default Database;
