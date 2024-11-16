import { MigrationInterface, QueryRunner } from "typeorm";

export class LoanAndDashboardSnapshots1730655514102 implements MigrationInterface {
    name = 'LoanAndDashboardSnapshots1730655514102'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c93c06f3e339528f8513e958c2"`);
        await queryRunner.query(`CREATE TABLE "crypto_dashboard_snapshot" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userStateId" uuid NOT NULL, "ethBalance" numeric(36,18) NOT NULL, "wethBalance" numeric(36,18) NOT NULL, "daiBalance" numeric(36,18) NOT NULL, "usdcBalance" numeric(36,18) NOT NULL, "activeOffers" integer NOT NULL, "activeLoans" integer NOT NULL, "repaidLoans" integer NOT NULL, "liquidatedLoans" integer NOT NULL, "wethActiveLoansPrincipal" numeric(36,18) NOT NULL, "daiActiveLoansPrincipal" numeric(36,18) NOT NULL, "usdcActiveLoansPrincipal" numeric(36,18) NOT NULL, "wethActiveLoansRepayment" numeric(36,18) NOT NULL, "daiActiveLoansRepayment" numeric(36,18) NOT NULL, "usdcActiveLoansRepayment" numeric(36,18) NOT NULL, CONSTRAINT "REL_d1036626420547b0b029116741" UNIQUE ("userStateId"), CONSTRAINT "PK_25be385988dc37617e33b696a70" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d1036626420547b0b029116741" ON "crypto_dashboard_snapshot" ("userStateId") `);
        await queryRunner.query(`CREATE TABLE "crypto_loan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userStateId" uuid NOT NULL, "nftfiLoanId" text NOT NULL, "status" text NOT NULL, "startedAt" TIMESTAMP NOT NULL, "repaidAt" TIMESTAMP, "dueAt" TIMESTAMP NOT NULL, "nftCollectionId" uuid NOT NULL, "nftTokenId" text NOT NULL, "nftImageUrl" text NOT NULL, "borrowerWalletAddress" text NOT NULL, "loanDuration" numeric(10,0) NOT NULL, "loanRepayment" numeric(36,18) NOT NULL, "loanPrincipal" numeric(36,18) NOT NULL, "loanApr" numeric(18,15) NOT NULL, "currency" text NOT NULL, "nftfiContractName" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_49135ef5d3e6159987e85e2c9f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8787b62b06a1efceb5e7dbfad5" ON "crypto_loan" ("userStateId", "status", "startedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_a61e21f2f2632b6e73e77f95a5" ON "crypto_loan_offer" ("userStateId", "isActive", "createdAt") `);
        await queryRunner.query(`ALTER TABLE "crypto_dashboard_snapshot" ADD CONSTRAINT "FK_d1036626420547b0b029116741b" FOREIGN KEY ("userStateId") REFERENCES "crypto_lending_user_state"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "crypto_loan" ADD CONSTRAINT "FK_d9a0b1eea2ef20fd7a377fe32cf" FOREIGN KEY ("userStateId") REFERENCES "crypto_lending_user_state"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "crypto_loan" ADD CONSTRAINT "FK_6f09f53ebd6bcd063b52781073d" FOREIGN KEY ("nftCollectionId") REFERENCES "nft_collection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crypto_loan" DROP CONSTRAINT "FK_6f09f53ebd6bcd063b52781073d"`);
        await queryRunner.query(`ALTER TABLE "crypto_loan" DROP CONSTRAINT "FK_d9a0b1eea2ef20fd7a377fe32cf"`);
        await queryRunner.query(`ALTER TABLE "crypto_dashboard_snapshot" DROP CONSTRAINT "FK_d1036626420547b0b029116741b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a61e21f2f2632b6e73e77f95a5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8787b62b06a1efceb5e7dbfad5"`);
        await queryRunner.query(`DROP TABLE "crypto_loan"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d1036626420547b0b029116741"`);
        await queryRunner.query(`DROP TABLE "crypto_dashboard_snapshot"`);
        await queryRunner.query(`CREATE INDEX "IDX_c93c06f3e339528f8513e958c2" ON "crypto_loan_offer" ("isActive") `);
    }

}
