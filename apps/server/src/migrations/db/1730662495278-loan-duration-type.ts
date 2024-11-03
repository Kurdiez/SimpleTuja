import { MigrationInterface, QueryRunner } from "typeorm";

export class LoanDurationType1730662495278 implements MigrationInterface {
    name = 'LoanDurationType1730662495278'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_loan" DROP COLUMN "loanDuration"`);
        await queryRunner.query(`ALTER TABLE "crypto_loan" ADD "loanDuration" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_loan" DROP COLUMN "loanDuration"`);
        await queryRunner.query(`ALTER TABLE "crypto_loan" ADD "loanDuration" numeric(10,0) NOT NULL`);
    }

}
