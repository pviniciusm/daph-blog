const { SnakeNamingStrategy } = require('typeorm-naming-strategies');

module.exports = {
  type: 'sqlite',
  database: 'src/database/db.sqlite3',
  logging: true,
  synchronize: true,
  entities: [
    'src/database/entities/*.ts'
  ],
  migrations: [
    'src/database/migrations/*.ts'
  ],
  cli: {
    entitiesDir: 'src/database/entities',
    migrationsDir: 'src/database/migrations'
  },
  namingStrategy: new SnakeNamingStrategy()
};
