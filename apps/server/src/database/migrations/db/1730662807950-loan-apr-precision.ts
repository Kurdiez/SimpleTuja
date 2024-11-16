import { MigrationInterface, QueryRunner } from "typeorm";

export class LoanAprPrecision1730662807950 implements MigrationInterface {
    name = 'LoanAprPrecision1730662807950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_loan" ALTER COLUMN "loanApr" TYPE numeric(36,15)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_loan" ALTER COLUMN "loanApr" TYPE numeric(18,15)`);
    }

}
