import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWalletAddress1729022981841 implements MigrationInterface {
    name = 'AddWalletAddress1729022981841'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ADD "walletAddress" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "walletPrivateKey" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "walletPrivateKey" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" DROP COLUMN "walletAddress"`);
    }

}
