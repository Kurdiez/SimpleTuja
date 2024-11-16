import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserEmailIndex1728710437189 implements MigrationInterface {
    name = 'AddUserEmailIndex1728710437189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
    }

}
