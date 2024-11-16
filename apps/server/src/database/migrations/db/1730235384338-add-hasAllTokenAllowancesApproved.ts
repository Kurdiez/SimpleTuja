import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHasAllTokenAllowancesApproved1730235384338 implements MigrationInterface {
    name = 'AddHasAllTokenAllowancesApproved1730235384338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ADD "hasAllTokenAllowancesApproved" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" DROP COLUMN "hasAllTokenAllowancesApproved"`);
    }

}
