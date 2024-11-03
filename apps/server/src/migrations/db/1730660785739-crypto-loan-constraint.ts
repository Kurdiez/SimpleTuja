import { MigrationInterface, QueryRunner } from "typeorm";

export class CryptoLoanConstraint1730660785739 implements MigrationInterface {
    name = 'CryptoLoanConstraint1730660785739'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_52f4800322aaf5b4d4ecc67c06" ON "crypto_loan" ("userStateId", "status", "dueAt") `);
        await queryRunner.query(`ALTER TABLE "crypto_loan" ADD CONSTRAINT "UQ_148663e398183e7fe9ca93f79cc" UNIQUE ("userStateId", "nftfiLoanId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_loan" DROP CONSTRAINT "UQ_148663e398183e7fe9ca93f79cc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_52f4800322aaf5b4d4ecc67c06"`);
    }

}
