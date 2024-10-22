import { MigrationInterface, QueryRunner } from "typeorm";

export class AddActiveStateCryptoLending1729618173245 implements MigrationInterface {
    name = 'AddActiveStateCryptoLending1729618173245'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ADD "active" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE INDEX "IDX_a67426a8acd200e7c1cbd55164" ON "crypto_lending_user_state" ("active") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a67426a8acd200e7c1cbd55164"`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" DROP COLUMN "active"`);
    }

}
