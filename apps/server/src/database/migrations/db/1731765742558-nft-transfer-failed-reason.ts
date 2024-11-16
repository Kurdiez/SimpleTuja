import { MigrationInterface, QueryRunner } from "typeorm";

export class NftTransferFailedReason1731765742558 implements MigrationInterface {
    name = 'NftTransferFailedReason1731765742558'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_loan" ADD "nftTransferFailedReason" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_loan" DROP COLUMN "nftTransferFailedReason"`);
    }

}
