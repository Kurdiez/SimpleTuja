import { MigrationInterface, QueryRunner } from "typeorm";

export class FixNftCollectionBidHistory1737818204742 implements MigrationInterface {
    name = 'FixNftCollectionBidHistory1737818204742'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection_bid_history" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "nft_collection_bid_history" DROP CONSTRAINT "PK_1eb41bd3d5e18969e3240c632ce"`);
        await queryRunner.query(`ALTER TABLE "nft_collection_bid_history" ADD CONSTRAINT "PK_171d98da32c8a056c63d2b584f0" PRIMARY KEY ("nftCollectionId", "id")`);
        await queryRunner.query(`ALTER TABLE "nft_collection_bid_history" DROP CONSTRAINT "PK_171d98da32c8a056c63d2b584f0"`);
        await queryRunner.query(`ALTER TABLE "nft_collection_bid_history" ADD CONSTRAINT "PK_ebf6848c3759451dc545e8ec802" PRIMARY KEY ("id")`);
        await queryRunner.query(`CREATE INDEX "IDX_1eb41bd3d5e18969e3240c632c" ON "nft_collection_bid_history" ("nftCollectionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1932794190aeed1d89b3041286" ON "nft_collection_bid_history" ("createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_1932794190aeed1d89b3041286"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1eb41bd3d5e18969e3240c632c"`);
        await queryRunner.query(`ALTER TABLE "nft_collection_bid_history" DROP CONSTRAINT "PK_ebf6848c3759451dc545e8ec802"`);
        await queryRunner.query(`ALTER TABLE "nft_collection_bid_history" ADD CONSTRAINT "PK_171d98da32c8a056c63d2b584f0" PRIMARY KEY ("nftCollectionId", "id")`);
        await queryRunner.query(`ALTER TABLE "nft_collection_bid_history" DROP CONSTRAINT "PK_171d98da32c8a056c63d2b584f0"`);
        await queryRunner.query(`ALTER TABLE "nft_collection_bid_history" ADD CONSTRAINT "PK_1eb41bd3d5e18969e3240c632ce" PRIMARY KEY ("nftCollectionId")`);
        await queryRunner.query(`ALTER TABLE "nft_collection_bid_history" DROP COLUMN "id"`);
    }

}
