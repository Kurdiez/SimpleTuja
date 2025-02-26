import { MigrationInterface, QueryRunner } from "typeorm";

export class TradePositionIdChange1740531498292 implements MigrationInterface {
    name = 'TradePositionIdChange1740531498292'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trading_position" DROP CONSTRAINT "PK_1dc62371e014d7a05f927ccb122"`);
        await queryRunner.query(`ALTER TABLE "trading_position" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "trading_position" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "trading_position" ADD CONSTRAINT "PK_1dc62371e014d7a05f927ccb122" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trading_position" DROP CONSTRAINT "PK_1dc62371e014d7a05f927ccb122"`);
        await queryRunner.query(`ALTER TABLE "trading_position" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "trading_position" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "trading_position" ADD CONSTRAINT "PK_1dc62371e014d7a05f927ccb122" PRIMARY KEY ("id")`);
    }

}
