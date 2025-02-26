import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMoreEpics1740659244583 implements MigrationInterface {
    name = 'AddMoreEpics1740659244583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."trading_position_epic_enum" RENAME TO "trading_position_epic_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."trading_position_epic_enum" AS ENUM('CS.D.EURUSD.CFD.IP', 'CS.D.EURUSD.MINI.IP', 'UA.D.AMBCUS.CASH.IP')`);
        await queryRunner.query(`ALTER TABLE "trading_position" ALTER COLUMN "epic" TYPE "public"."trading_position_epic_enum" USING "epic"::"text"::"public"."trading_position_epic_enum"`);
        await queryRunner.query(`DROP TYPE "public"."trading_position_epic_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."ig_epic_price_epic_enum" RENAME TO "ig_epic_price_epic_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."ig_epic_price_epic_enum" AS ENUM('CS.D.EURUSD.CFD.IP', 'CS.D.EURUSD.MINI.IP', 'UA.D.AMBCUS.CASH.IP')`);
        await queryRunner.query(`ALTER TABLE "ig_epic_price" ALTER COLUMN "epic" TYPE "public"."ig_epic_price_epic_enum" USING "epic"::"text"::"public"."ig_epic_price_epic_enum"`);
        await queryRunner.query(`DROP TYPE "public"."ig_epic_price_epic_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ig_epic_price_epic_enum_old" AS ENUM('CS.D.EURUSD.CFD.IP', 'UA.D.AMBCUS.CASH.IP')`);
        await queryRunner.query(`ALTER TABLE "ig_epic_price" ALTER COLUMN "epic" TYPE "public"."ig_epic_price_epic_enum_old" USING "epic"::"text"::"public"."ig_epic_price_epic_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."ig_epic_price_epic_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."ig_epic_price_epic_enum_old" RENAME TO "ig_epic_price_epic_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."trading_position_epic_enum_old" AS ENUM('CS.D.EURUSD.CFD.IP', 'UA.D.AMBCUS.CASH.IP')`);
        await queryRunner.query(`ALTER TABLE "trading_position" ALTER COLUMN "epic" TYPE "public"."trading_position_epic_enum_old" USING "epic"::"text"::"public"."trading_position_epic_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."trading_position_epic_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."trading_position_epic_enum_old" RENAME TO "trading_position_epic_enum"`);
    }

}
