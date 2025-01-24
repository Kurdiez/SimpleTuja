import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIgPriceSnapshotTable1738441332062 implements MigrationInterface {
    name = 'AddIgPriceSnapshotTable1738441332062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ig_epic_price_epic_enum" AS ENUM('CS.D.EURUSD.CFD.IP', 'UA.D.AMBCUS.CASH.IP')`);
        await queryRunner.query(`CREATE TYPE "public"."ig_epic_price_timeframe_enum" AS ENUM('SECOND', 'MINUTE', 'MINUTE_2', 'MINUTE_3', 'MINUTE_5', 'MINUTE_10', 'MINUTE_15', 'MINUTE_30', 'HOUR', 'HOUR_2', 'HOUR_3', 'HOUR_4', 'DAY', 'WEEK', 'MONTH')`);
        await queryRunner.query(`CREATE TABLE "ig_epic_price" ("epic" "public"."ig_epic_price_epic_enum" NOT NULL, "timeFrame" "public"."ig_epic_price_timeframe_enum" NOT NULL, "time" date NOT NULL, "snapshot" jsonb NOT NULL, CONSTRAINT "PK_4d4249cd060d5b482be07da7bd6" PRIMARY KEY ("epic", "timeFrame", "time"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "ig_epic_price"`);
        await queryRunner.query(`DROP TYPE "public"."ig_epic_price_timeframe_enum"`);
        await queryRunner.query(`DROP TYPE "public"."ig_epic_price_epic_enum"`);
    }

}
