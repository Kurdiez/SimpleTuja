import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLoanOffEntity1729750301133 implements MigrationInterface {
  name = 'AddLoanOffEntity1729750301133';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "crypto_loan_offer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nftfiOfferId" uuid NOT NULL, "dateOffered" TIMESTAMP NOT NULL, "nftCollectionId" uuid NOT NULL, "userStateId" uuid NOT NULL, "loanCurrency" text NOT NULL, "loanDuration" numeric(10,0) NOT NULL, "loanRepayment" numeric(36,18) NOT NULL, "loanPrincipal" numeric(36,18) NOT NULL, "loanApr" numeric(18,15) NOT NULL, "loanExpiry" TIMESTAMP NOT NULL, "loanInterestProrated" boolean NOT NULL, "loanOrigination" numeric(36,18) NOT NULL, "loanEffectiveApr" numeric(18,15) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1e2aa1e865eab8eff106dfe1f28" UNIQUE ("nftfiOfferId"), CONSTRAINT "PK_a5bef45007056edf5131d8cbfba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c93c06f3e339528f8513e958c2" ON "crypto_loan_offer" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aa109806d05267427c23162859" ON "nft_collection" ("contractAddress") `,
    );
    await queryRunner.query(
      `ALTER TABLE "crypto_loan_offer" ADD CONSTRAINT "FK_cbe353865be40929724a750e985" FOREIGN KEY ("nftCollectionId") REFERENCES "nft_collection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crypto_loan_offer" ADD CONSTRAINT "FK_becb492c063b1f531e426d50038" FOREIGN KEY ("userStateId") REFERENCES "crypto_lending_user_state"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "crypto_loan_offer" DROP CONSTRAINT "FK_becb492c063b1f531e426d50038"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crypto_loan_offer" DROP CONSTRAINT "FK_cbe353865be40929724a750e985"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_aa109806d05267427c23162859"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c93c06f3e339528f8513e958c2"`,
    );
    await queryRunner.query(`DROP TABLE "crypto_loan_offer"`);
  }
}
