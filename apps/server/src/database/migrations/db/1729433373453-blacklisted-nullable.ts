import { MigrationInterface, QueryRunner } from "typeorm";

export class BlacklistedNullable1729433373453 implements MigrationInterface {
    name = 'BlacklistedNullable1729433373453'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" ALTER COLUMN "blackListed" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ALTER COLUMN "blackListed" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" ALTER COLUMN "blackListed" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ALTER COLUMN "blackListed" SET NOT NULL`);
    }

}
