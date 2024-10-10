import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveEmailConfirmTokenExpiration1728672777090 implements MigrationInterface {
    name = 'RemoveEmailConfirmTokenExpiration1728672777090'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tokenExpiration"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "tokenExpiration" TIMESTAMP`);
    }

}
