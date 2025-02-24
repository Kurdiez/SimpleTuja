import { MigrationInterface, QueryRunner } from "typeorm";

export class TradePositionStatus1740418459822 implements MigrationInterface {
    name = 'TradePositionStatus1740418459822'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."trading_position_status_enum" AS ENUM('PENDING', 'OPENED', 'CLOSED')`);
        await queryRunner.query(`ALTER TABLE "trading_position" ADD "status" "public"."trading_position_status_enum" NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`CREATE INDEX "IDX_16463d8e5d9b8b1bf84a8fa6e2" ON "trading_position" ("status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_16463d8e5d9b8b1bf84a8fa6e2"`);
        await queryRunner.query(`ALTER TABLE "trading_position" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."trading_position_status_enum"`);
    }

}
