import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStrategyEnum1740057943269 implements MigrationInterface {
    name = 'UpdateStrategyEnum1740057943269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."trading_position_strategy_enum" RENAME TO "trading_position_strategy_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."trading_position_strategy_enum" AS ENUM('DTIG_AI')`);
        await queryRunner.query(`ALTER TABLE "trading_position" ALTER COLUMN "strategy" TYPE "public"."trading_position_strategy_enum" USING "strategy"::"text"::"public"."trading_position_strategy_enum"`);
        await queryRunner.query(`DROP TYPE "public"."trading_position_strategy_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."trading_position_strategy_enum_old" AS ENUM('N8N_AI')`);
        await queryRunner.query(`ALTER TABLE "trading_position" ALTER COLUMN "strategy" TYPE "public"."trading_position_strategy_enum_old" USING "strategy"::"text"::"public"."trading_position_strategy_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."trading_position_strategy_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."trading_position_strategy_enum_old" RENAME TO "trading_position_strategy_enum"`);
    }

}
