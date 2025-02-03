import { MigrationInterface, QueryRunner } from "typeorm";

export class PriceTimeColumnFix1738579423154 implements MigrationInterface {
    name = 'PriceTimeColumnFix1738579423154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ig_epic_price" DROP CONSTRAINT "PK_4d4249cd060d5b482be07da7bd6"`);
        await queryRunner.query(`ALTER TABLE "ig_epic_price" ADD CONSTRAINT "PK_9fa9d6160e8e35064971ba796ed" PRIMARY KEY ("epic", "timeFrame")`);
        await queryRunner.query(`ALTER TABLE "ig_epic_price" DROP COLUMN "time"`);
        await queryRunner.query(`ALTER TABLE "ig_epic_price" ADD "time" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ig_epic_price" DROP CONSTRAINT "PK_9fa9d6160e8e35064971ba796ed"`);
        await queryRunner.query(`ALTER TABLE "ig_epic_price" ADD CONSTRAINT "PK_4d4249cd060d5b482be07da7bd6" PRIMARY KEY ("epic", "timeFrame", "time")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ig_epic_price" DROP CONSTRAINT "PK_4d4249cd060d5b482be07da7bd6"`);
        await queryRunner.query(`ALTER TABLE "ig_epic_price" ADD CONSTRAINT "PK_9fa9d6160e8e35064971ba796ed" PRIMARY KEY ("epic", "timeFrame")`);
        await queryRunner.query(`ALTER TABLE "ig_epic_price" DROP COLUMN "time"`);
        await queryRunner.query(`ALTER TABLE "ig_epic_price" ADD "time" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ig_epic_price" DROP CONSTRAINT "PK_9fa9d6160e8e35064971ba796ed"`);
        await queryRunner.query(`ALTER TABLE "ig_epic_price" ADD CONSTRAINT "PK_4d4249cd060d5b482be07da7bd6" PRIMARY KEY ("epic", "timeFrame", "time")`);
    }

}
