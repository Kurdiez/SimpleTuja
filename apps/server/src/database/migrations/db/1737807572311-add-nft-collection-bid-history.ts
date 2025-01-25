import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNftCollectionBidHistory1737807572311 implements MigrationInterface {
    name = 'AddNftCollectionBidHistory1737807572311'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "nft_collection_bid_history" ("nftCollectionId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "avgTopFiveBids" numeric(30,10) DEFAULT '0', CONSTRAINT "PK_1eb41bd3d5e18969e3240c632ce" PRIMARY KEY ("nftCollectionId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "nft_collection_bid_history"`);
    }

}
