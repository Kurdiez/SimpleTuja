import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOpenSeaSlug1727617632711 implements MigrationInterface {
    name = 'AddOpenSeaSlug1727617632711'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "openSeaSlug" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "openSeaSlug"`);
    }

}
