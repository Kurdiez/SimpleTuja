import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPositionSize1740659501941 implements MigrationInterface {
    name = 'AddPositionSize1740659501941'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trading_position" ADD "size" numeric(36,18)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trading_position" DROP COLUMN "size"`);
    }

}
