import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTradingPerformanceReportTable1740933648998 implements MigrationInterface {
    name = 'AddedTradingPerformanceReportTable1740933648998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."trading_performance_report_epic_enum" AS ENUM('CS.D.EURUSD.CFD.IP', 'CS.D.EURUSD.MINI.IP', 'UA.D.AMBCUS.CASH.IP')`);
        await queryRunner.query(`CREATE TABLE "trading_performance_report" ("epic" "public"."trading_performance_report_epic_enum" NOT NULL, "report" text NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_27a683e69226b29303db7050e56" PRIMARY KEY ("epic"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "trading_performance_report"`);
        await queryRunner.query(`DROP TYPE "public"."trading_performance_report_epic_enum"`);
    }

}
