import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDayAheadPriceTable1710000000000 implements MigrationInterface {
  name = 'CreateDayAheadPriceTable1710000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "day_ahead_price" (
        "id" SERIAL NOT NULL, 
        "position" integer NOT NULL, 
        "price" double precision NOT NULL, 
        "zone" character varying NOT NULL, 
        "fetchedAt" TIMESTAMP NOT NULL DEFAULT now(), 
        CONSTRAINT "PK_e7b62bcf7ff8f83fedbd5afe99a" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "day_ahead_price"
    `);
  }
}
