import { MigrationInterface, QueryRunner } from "typeorm";

export class SplitCryptoLoanOfferCompositeIndex1731627437678 implements MigrationInterface {
    name = 'SplitCryptoLoanOfferCompositeIndex1731627437678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a61e21f2f2632b6e73e77f95a5"`);
        await queryRunner.query(`CREATE INDEX "IDX_37925edaf297edbc2265bbb3d1" ON "crypto_loan_offer" ("loanDuration") `);
        await queryRunner.query(`CREATE INDEX "IDX_f5f359afbaf46384385e846df8" ON "crypto_loan_offer" ("userStateId", "isActive") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_f5f359afbaf46384385e846df8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_37925edaf297edbc2265bbb3d1"`);
        await queryRunner.query(`CREATE INDEX "IDX_a61e21f2f2632b6e73e77f95a5" ON "crypto_loan_offer" ("userStateId", "isActive", "createdAt") `);
    }

}
