import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserColumnToAddresses1745887157975
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "addresses" ADD "user_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_addresses_users" FOREIGN KEY ("user_id") REFERENCES "users"("id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_addresses_users"`,
    );
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "user_id"`);
  }
}
