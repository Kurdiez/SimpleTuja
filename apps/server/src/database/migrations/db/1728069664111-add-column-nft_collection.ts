import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnNftCollection1728069664111 implements MigrationInterface {
  name = 'AddColumnNftCollection1728069664111';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_collection" ADD "avgTopFiveBids" numeric(30,10) DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_collection" ALTER COLUMN "enabled" SET DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_collection" ALTER COLUMN "enabled" SET DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_collection" DROP COLUMN "avgTopFiveBids"`,
    );
  }
}
