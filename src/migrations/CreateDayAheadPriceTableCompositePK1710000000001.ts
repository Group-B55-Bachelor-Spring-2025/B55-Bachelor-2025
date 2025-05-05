import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDayAheadPriceTableCompositePK1710000000001 implements MigrationInterface {
  name = 'CreateDayAheadPriceTableCompositePK1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "day_ahead_price"
    `);
    
    await queryRunner.query(`
      CREATE TABLE "day_ahead_price" (
        "zone" VARCHAR NOT NULL,
        "date" DATE NOT NULL,
        "prices" double precision[] NOT NULL,
        "fetchedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_day_ahead_price_zone_date" PRIMARY KEY ("zone", "date")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "day_ahead_price"
    `);
  }
}
