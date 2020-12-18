import { MigrationInterface, QueryRunner } from 'typeorm';

export class PostAndUserTables1608241839443 implements MigrationInterface {
    name = 'PostAndUserTables1608241839443'

    public async up (queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('CREATE TABLE "user" ("email" varchar(77) NOT NULL, "username" varchar(30) PRIMARY KEY NOT NULL, "password" varchar(50) NOT NULL, "name" varchar(50) NOT NULL, "last_name" varchar(50) NOT NULL, "updated_at" datetime NOT NULL DEFAULT (datetime(\'now\')), "created_at" datetime NOT NULL DEFAULT (datetime(\'now\')))');
      await queryRunner.query('CREATE TABLE "post" ("post_id" varchar(120) NOT NULL, "content" varchar(300) NOT NULL, "updated_at" datetime NOT NULL DEFAULT (datetime(\'now\')), "created_at" datetime NOT NULL DEFAULT (datetime(\'now\')), "username" varchar(30) NOT NULL, PRIMARY KEY ("post_id", "username"))');
      await queryRunner.query('CREATE TABLE "temporary_post" ("post_id" varchar(120) NOT NULL, "content" varchar(300) NOT NULL, "updated_at" datetime NOT NULL DEFAULT (datetime(\'now\')), "created_at" datetime NOT NULL DEFAULT (datetime(\'now\')), "username" varchar(30) NOT NULL, CONSTRAINT "FK_57e75616264342b9a2637cfbfb9" FOREIGN KEY ("username") REFERENCES "user" ("username") ON DELETE CASCADE ON UPDATE RESTRICT, PRIMARY KEY ("post_id", "username"))');
      await queryRunner.query('INSERT INTO "temporary_post"("post_id", "content", "updated_at", "created_at", "username") SELECT "post_id", "content", "updated_at", "created_at", "username" FROM "post"');
      await queryRunner.query('DROP TABLE "post"');
      await queryRunner.query('ALTER TABLE "temporary_post" RENAME TO "post"');
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE "post" RENAME TO "temporary_post"');
      await queryRunner.query('CREATE TABLE "post" ("post_id" varchar(120) NOT NULL, "content" varchar(300) NOT NULL, "updated_at" datetime NOT NULL DEFAULT (datetime(\'now\')), "created_at" datetime NOT NULL DEFAULT (datetime(\'now\')), "username" varchar(30) NOT NULL, PRIMARY KEY ("post_id", "username"))');
      await queryRunner.query('INSERT INTO "post"("post_id", "content", "updated_at", "created_at", "username") SELECT "post_id", "content", "updated_at", "created_at", "username" FROM "temporary_post"');
      await queryRunner.query('DROP TABLE "temporary_post"');
      await queryRunner.query('DROP TABLE "post"');
      await queryRunner.query('DROP TABLE "user"');
    }
}
