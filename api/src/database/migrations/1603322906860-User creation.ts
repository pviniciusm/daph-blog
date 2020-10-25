import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserCreation1603322906860 implements MigrationInterface {
    name = 'UserCreation1603322906860'

    public async up (queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('CREATE TABLE "user" ("email" varchar(77) PRIMARY KEY NOT NULL, "password" varchar(50) NOT NULL, "name" varchar(50) NOT NULL, "last_name" varchar(50) NOT NULL, "updated_at" datetime NOT NULL DEFAULT (datetime(\'now\')), "created_at" datetime NOT NULL DEFAULT (datetime(\'now\')))');
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('DROP TABLE "user"');
    }
}
