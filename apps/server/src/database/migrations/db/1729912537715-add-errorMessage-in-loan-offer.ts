import { MigrationInterface, QueryRunner } from "typeorm";

export class AddErrorMessageInLoanOffer1729912537715 implements MigrationInterface {
    name = 'AddErrorMessageInLoanOffer1729912537715'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_loan_offer" ADD "errorMessage" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_loan_offer" DROP COLUMN "errorMessage"`);
    }

}
