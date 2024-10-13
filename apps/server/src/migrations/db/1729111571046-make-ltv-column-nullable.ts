import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeLtvColumnNullable1729111571046 implements MigrationInterface {
    name = 'MakeLtvColumnNullable1729111571046'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "oneWeekLTV" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "oneWeekLTV" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "twoWeeksLTV" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "twoWeeksLTV" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "oneMonthLTV" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "oneMonthLTV" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "twoMonthsLTV" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "twoMonthsLTV" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "threeMonthsLTV" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "threeMonthsLTV" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "threeMonthsLTV" SET DEFAULT '40'`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "threeMonthsLTV" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "twoMonthsLTV" SET DEFAULT '50'`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "twoMonthsLTV" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "oneMonthLTV" SET DEFAULT '60'`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "oneMonthLTV" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "twoWeeksLTV" SET DEFAULT '65'`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "twoWeeksLTV" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "oneWeekLTV" SET DEFAULT '70'`);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ALTER COLUMN "oneWeekLTV" SET NOT NULL`);
    }

}
