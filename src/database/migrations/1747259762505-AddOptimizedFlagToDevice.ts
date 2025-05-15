import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOptimizedFlagToDevice1747259762505
  implements MigrationInterface
{
  name = 'AddOptimizedFlagToDevice1747259762505';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "targetTemperature" integer`,
    );
    await queryRunner.query(`ALTER TABLE "devices" ADD "optimized" boolean`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "optimized"`);
    await queryRunner.query(
      `ALTER TABLE "devices" DROP COLUMN "targetTemperature"`,
    );
  }
}
