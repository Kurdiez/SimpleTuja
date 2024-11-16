import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAverageAPR1729802813521 implements MigrationInterface {
    name = 'AddAverageAPR1729802813521'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "averageApr" numeric(18,15)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "averageApr"`);
    }

}
