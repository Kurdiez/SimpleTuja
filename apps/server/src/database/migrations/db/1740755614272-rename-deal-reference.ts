import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameDealReference1740755614272 implements MigrationInterface {
    name = 'RenameDealReference1740755614272'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_b9dc99ab6703eb4e9d492b7746"`);
        await queryRunner.query(`ALTER TABLE "trading_position" RENAME COLUMN "igOrderDealId" TO "igPositionOpenDealReference"`);
        await queryRunner.query(`CREATE INDEX "IDX_8633a87dd839578def102cfd9c" ON "trading_position" ("igPositionOpenDealReference") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_8633a87dd839578def102cfd9c"`);
        await queryRunner.query(`ALTER TABLE "trading_position" RENAME COLUMN "igPositionOpenDealReference" TO "igOrderDealId"`);
        await queryRunner.query(`CREATE INDEX "IDX_b9dc99ab6703eb4e9d492b7746" ON "trading_position" ("igOrderDealId") `);
    }

}
