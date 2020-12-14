import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsernameFieldOnUserModel1607966880245 implements MigrationInterface {
    name = 'UsernameFieldOnUserModel1607966880245'

    public async up (queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('CREATE TABLE "temporary_user" ("email" varchar(77) PRIMARY KEY NOT NULL, "password" varchar(50) NOT NULL, "name" varchar(50) NOT NULL, "last_name" varchar(50) NOT NULL, "updated_at" datetime NOT NULL DEFAULT (datetime(\'now\')), "created_at" datetime NOT NULL DEFAULT (datetime(\'now\')), "username" varchar(30) NOT NULL)');
      await queryRunner.query('INSERT INTO "temporary_user"("email", "password", "name", "last_name", "updated_at", "created_at") SELECT "email", "password", "name", "last_name", "updated_at", "created_at" FROM "user"');
      await queryRunner.query('DROP TABLE "user"');
      await queryRunner.query('ALTER TABLE "temporary_user" RENAME TO "user"');
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE "user" RENAME TO "temporary_user"');
      await queryRunner.query('CREATE TABLE "user" ("email" varchar(77) PRIMARY KEY NOT NULL, "password" varchar(50) NOT NULL, "name" varchar(50) NOT NULL, "last_name" varchar(50) NOT NULL, "updated_at" datetime NOT NULL DEFAULT (datetime(\'now\')), "created_at" datetime NOT NULL DEFAULT (datetime(\'now\')))');
      await queryRunner.query('INSERT INTO "user"("email", "password", "name", "last_name", "updated_at", "created_at") SELECT "email", "password", "name", "last_name", "updated_at", "created_at" FROM "temporary_user"');
      await queryRunner.query('DROP TABLE "temporary_user"');
    }
}
