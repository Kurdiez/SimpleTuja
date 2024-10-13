import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCryptoLendingUserState1728740354029 implements MigrationInterface {
    name = 'AddCryptoLendingUserState1728740354029'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "crypto_lending_user_state" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "hasOpenedCryptoInvestmentAccount" boolean NOT NULL DEFAULT false, "hasCompletedLoanSettings" boolean NOT NULL DEFAULT false, "hasFundedTheAccount" boolean NOT NULL DEFAULT false, "walletPrivateKey" text, "oneWeekLTV" integer NOT NULL DEFAULT '70', "twoWeeksLTV" integer NOT NULL DEFAULT '65', "oneMonthLTV" integer NOT NULL DEFAULT '60', "twoMonthsLTV" integer NOT NULL DEFAULT '50', "threeMonthsLTV" integer NOT NULL DEFAULT '40', "foreclosureWalletAddress" text, CONSTRAINT "REL_60abf6bfdca138a031e8606c89" UNIQUE ("userId"), CONSTRAINT "PK_116ec6deecc14947c1c66b5dbc2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_60abf6bfdca138a031e8606c89" ON "crypto_lending_user_state" ("userId") `);
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" ADD CONSTRAINT "FK_60abf6bfdca138a031e8606c898" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_lending_user_state" DROP CONSTRAINT "FK_60abf6bfdca138a031e8606c898"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_60abf6bfdca138a031e8606c89"`);
        await queryRunner.query(`DROP TABLE "crypto_lending_user_state"`);
    }

}
