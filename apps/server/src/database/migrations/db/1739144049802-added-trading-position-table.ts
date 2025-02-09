import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTradingPositionTable1739144049802 implements MigrationInterface {
    name = 'AddedTradingPositionTable1739144049802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."trading_position_strategy_enum" AS ENUM('N8N_AI')`);
        await queryRunner.query(`CREATE TYPE "public"."trading_position_epic_enum" AS ENUM('CS.D.EURUSD.CFD.IP', 'UA.D.AMBCUS.CASH.IP')`);
        await queryRunner.query(`CREATE TYPE "public"."trading_position_direction_enum" AS ENUM('BUY', 'SELL')`);
        await queryRunner.query(`CREATE TABLE "trading_position" ("id" SERIAL NOT NULL, "brokerDealId" character varying NOT NULL, "brokerPositionId" character varying, "strategy" "public"."trading_position_strategy_enum" NOT NULL, "epic" "public"."trading_position_epic_enum" NOT NULL, "direction" "public"."trading_position_direction_enum" NOT NULL, "entryPrice" numeric(36,18), "exitPrice" numeric(36,18), "stopLossPrice" numeric(36,18), "takeProfitPrice" numeric(36,18), "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "exitedAt" TIMESTAMP, CONSTRAINT "PK_1dc62371e014d7a05f927ccb122" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_34ad975ffe69208f37a43dd1f8" ON "trading_position" ("brokerDealId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ba0aad651f102bf4ce2a9c7763" ON "trading_position" ("brokerPositionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1d45759d386eb2e3f06bf09d23" ON "trading_position" ("strategy") `);
        await queryRunner.query(`CREATE INDEX "IDX_645ae63b2abacd5956c0f944dc" ON "trading_position" ("epic") `);
        await queryRunner.query(`CREATE INDEX "IDX_b4b589ce2feb03728a8947c120" ON "trading_position" ("direction") `);
        await queryRunner.query(`CREATE INDEX "IDX_94089b6c895163404fc585632c" ON "trading_position" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_d0f254ede085d5d0827d39ec3f" ON "trading_position" ("exitedAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_d0f254ede085d5d0827d39ec3f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_94089b6c895163404fc585632c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b4b589ce2feb03728a8947c120"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_645ae63b2abacd5956c0f944dc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1d45759d386eb2e3f06bf09d23"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ba0aad651f102bf4ce2a9c7763"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_34ad975ffe69208f37a43dd1f8"`);
        await queryRunner.query(`DROP TABLE "trading_position"`);
        await queryRunner.query(`DROP TYPE "public"."trading_position_direction_enum"`);
        await queryRunner.query(`DROP TYPE "public"."trading_position_epic_enum"`);
        await queryRunner.query(`DROP TYPE "public"."trading_position_strategy_enum"`);
    }

}
