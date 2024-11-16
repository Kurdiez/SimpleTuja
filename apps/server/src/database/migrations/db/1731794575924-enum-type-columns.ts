import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnumTypeColumns1731794575924 implements MigrationInterface {
  name = 'EnumTypeColumns1731794575924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."crypto_loan_offer_loancurrency_enum" AS ENUM('ETH', 'wETH', 'DAI', 'USDC')`,
    );
    await queryRunner.query(`ALTER TABLE "crypto_loan_offer" 
            ALTER COLUMN "loanCurrency" TYPE "public"."crypto_loan_offer_loancurrency_enum" 
            USING "loanCurrency"::"public"."crypto_loan_offer_loancurrency_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_52f4800322aaf5b4d4ecc67c06"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8787b62b06a1efceb5e7dbfad5"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."crypto_loan_status_enum" AS ENUM('active', 'repaid', 'defaulted', 'liquidated', 'liquidation_failed', 'nft_transferred', 'nft_transfer_failed')`,
    );
    await queryRunner.query(`ALTER TABLE "crypto_loan" 
            ALTER COLUMN "status" TYPE "public"."crypto_loan_status_enum" 
            USING "status"::"public"."crypto_loan_status_enum"`);
    await queryRunner.query(
      `CREATE TYPE "public"."crypto_loan_nfttransferfailedreason_enum" AS ENUM('insufficient_eth_for_gas_fee', 'unknown_error')`,
    );
    await queryRunner.query(`ALTER TABLE "crypto_loan" 
            ALTER COLUMN "nftTransferFailedReason" TYPE "public"."crypto_loan_nfttransferfailedreason_enum" 
            USING "nftTransferFailedReason"::"public"."crypto_loan_nfttransferfailedreason_enum"`);
    await queryRunner.query(
      `CREATE TYPE "public"."crypto_loan_liquidationfailedreason_enum" AS ENUM('insufficient_eth_for_gas_fee', 'unknown_error')`,
    );
    await queryRunner.query(`ALTER TABLE "crypto_loan" 
            ALTER COLUMN "liquidationFailedReason" TYPE "public"."crypto_loan_liquidationfailedreason_enum" 
            USING "liquidationFailedReason"::"public"."crypto_loan_liquidationfailedreason_enum"`);
    await queryRunner.query(
      `CREATE TYPE "public"."crypto_loan_token_enum" AS ENUM('ETH', 'wETH', 'DAI', 'USDC')`,
    );
    await queryRunner.query(`ALTER TABLE "crypto_loan" 
            ALTER COLUMN "token" TYPE "public"."crypto_loan_token_enum" 
            USING "token"::"public"."crypto_loan_token_enum"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_52f4800322aaf5b4d4ecc67c06" ON "crypto_loan" ("userStateId", "status", "dueAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8787b62b06a1efceb5e7dbfad5" ON "crypto_loan" ("userStateId", "status", "startedAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8787b62b06a1efceb5e7dbfad5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_52f4800322aaf5b4d4ecc67c06"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crypto_loan" ALTER COLUMN "token" TYPE text`,
    );
    await queryRunner.query(`DROP TYPE "public"."crypto_loan_token_enum"`);
    await queryRunner.query(
      `ALTER TABLE "crypto_loan" ALTER COLUMN "liquidationFailedReason" TYPE text`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."crypto_loan_liquidationfailedreason_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crypto_loan" ALTER COLUMN "nftTransferFailedReason" TYPE text`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."crypto_loan_nfttransferfailedreason_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crypto_loan" ALTER COLUMN "status" TYPE text`,
    );
    await queryRunner.query(`DROP TYPE "public"."crypto_loan_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "crypto_loan_offer" ALTER COLUMN "loanCurrency" TYPE text`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."crypto_loan_offer_loancurrency_enum"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8787b62b06a1efceb5e7dbfad5" ON "crypto_loan" ("userStateId", "status", "startedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_52f4800322aaf5b4d4ecc67c06" ON "crypto_loan" ("userStateId", "status", "dueAt") `,
    );
  }
}
