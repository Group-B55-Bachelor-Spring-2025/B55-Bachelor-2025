import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePricePointTable1745912908850 implements MigrationInterface {
    name = 'CreatePricePointTable1745912908850'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "price_point" ("id" SERIAL NOT NULL, "position" integer NOT NULL, "price" double precision NOT NULL, "fetchedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f84710cb555b9b26532f7ae31ed" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "price_point"`);
    }

}
