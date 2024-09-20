import { MigrationInterface, QueryRunner } from 'typeorm';

export class NftEntity1726815968211 implements MigrationInterface {
  name = 'NftEntity1726815968211';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nft" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "contractAddress" character varying NOT NULL, "enabled" boolean NOT NULL DEFAULT true, "blackListed" boolean NOT NULL DEFAULT false, "loanCount" integer NOT NULL DEFAULT '0', "bestBid" numeric(30,10) DEFAULT '0', CONSTRAINT "PK_8f46897c58e23b0e7bf6c8e56b0" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "nft"`);
  }
}
