import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNftCollection1727610835425 implements MigrationInterface {
    name = 'AddNftCollection1727610835425'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "nft_collection" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "contractAddress" character varying, "enabled" boolean NOT NULL DEFAULT true, "blackListed" boolean NOT NULL DEFAULT false, "loanCount" integer NOT NULL DEFAULT '0', "bestBid" numeric(30,10) DEFAULT '0', CONSTRAINT "UQ_abbd9e08596d903a2bbf747c6b1" UNIQUE ("name"), CONSTRAINT "PK_ffe58aa05707db77c2f20ecdbc3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "nft_collection"`);
    }

}
