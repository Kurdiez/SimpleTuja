import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUser1728456033831 implements MigrationInterface {
  name = 'AddUser1728456033831';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "isEmailConfirmed" boolean NOT NULL DEFAULT false, "emailConfirmationToken" character varying, "tokenExpiration" TIMESTAMP, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f103f1e4534e4f4b342f5763c4" ON "user" ("emailConfirmationToken") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f103f1e4534e4f4b342f5763c4"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
