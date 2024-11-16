import { MigrationInterface, QueryRunner } from "typeorm";

export class ImageUrlNftCollection1731530820886 implements MigrationInterface {
    name = 'ImageUrlNftCollection1731530820886'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "imageUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "imageUrl"`);
    }

}
