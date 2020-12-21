import Infra, { Return, ToInterface } from '../util';
import { AbstractRepository, getManager, InsertResult, SelectQueryBuilder } from 'typeorm';

abstract class Database<T> extends AbstractRepository<T> {
  constructor (name?: string) {
    super();
    this.manager = getManager();
    this.name = name;
  }

  protected async _create (data: Object): Promise<Return> {
    try {
      const retCreate: InsertResult = await this.repository.insert(data);
      const newEntity = ToInterface<T>(retCreate.identifiers[0]);

      return new Infra.Success(newEntity);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  protected async _get (query: SelectQueryBuilder<T>): Promise<Return> {
    try {
      const retGet = await query.getRawOne();

      if (!retGet) {
        return new Infra.InexistentEntryError(this.name || 'Entry');
      }

      const obtainedEntry = ToInterface<T>(retGet);

      return new Infra.Success(obtainedEntry, `${this.name || 'Entry'} was successfully obtained`, 201);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  protected async _delete (data: Object): Promise<Return> {
    try {
      const retRemove = await this.repository.delete(data);

      return new Infra.Success(retRemove, `${this.name || 'Entry'} was successfully removed`, 200);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }

  protected _selectQueryBuilder (alias: string): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(alias);
  }

  protected async _update (findConditions: Object, data: Object): Promise<Return> {
    try {
      const retUpdate = await this.repository.update(findConditions, data);
      return new Infra.Success(retUpdate);
    } catch (ex) {
      return new Infra.Exception(ex.toString());
    }
  }
}

export default Database;
