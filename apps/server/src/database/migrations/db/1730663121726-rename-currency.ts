import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameCurrency1730663121726 implements MigrationInterface {
    name = 'RenameCurrency1730663121726'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_loan" RENAME COLUMN "currency" TO "token"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_loan" RENAME COLUMN "token" TO "currency"`);
    }

}
