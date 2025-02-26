import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameDealIdColumns1740744022683 implements MigrationInterface {
    name = 'RenameDealIdColumns1740744022683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_34ad975ffe69208f37a43dd1f8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ba0aad651f102bf4ce2a9c7763"`);
        await queryRunner.query(`ALTER TABLE "trading_position" DROP COLUMN "brokerDealId"`);
        await queryRunner.query(`ALTER TABLE "trading_position" DROP COLUMN "brokerPositionId"`);
        await queryRunner.query(`ALTER TABLE "trading_position" ADD "igOrderDealId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "trading_position" ADD "igPositionOpenDealId" character varying`);
        await queryRunner.query(`CREATE INDEX "IDX_b9dc99ab6703eb4e9d492b7746" ON "trading_position" ("igOrderDealId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c4d6efa436c24ad31b613cfd3c" ON "trading_position" ("igPositionOpenDealId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c4d6efa436c24ad31b613cfd3c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b9dc99ab6703eb4e9d492b7746"`);
        await queryRunner.query(`ALTER TABLE "trading_position" DROP COLUMN "igPositionOpenDealId"`);
        await queryRunner.query(`ALTER TABLE "trading_position" DROP COLUMN "igOrderDealId"`);
        await queryRunner.query(`ALTER TABLE "trading_position" ADD "brokerPositionId" character varying`);
        await queryRunner.query(`ALTER TABLE "trading_position" ADD "brokerDealId" character varying NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_ba0aad651f102bf4ce2a9c7763" ON "trading_position" ("brokerPositionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_34ad975ffe69208f37a43dd1f8" ON "trading_position" ("brokerDealId") `);
    }

}
