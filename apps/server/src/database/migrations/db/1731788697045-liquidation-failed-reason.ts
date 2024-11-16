import { MigrationInterface, QueryRunner } from "typeorm";

export class LiquidationFailedReason1731788697045 implements MigrationInterface {
    name = 'LiquidationFailedReason1731788697045'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_loan" ADD "liquidationFailedReason" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_loan" DROP COLUMN "liquidationFailedReason"`);
    }

}
