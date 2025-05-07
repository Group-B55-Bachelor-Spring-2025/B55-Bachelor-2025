import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintToDevices1746643269769
  implements MigrationInterface
{
  name = 'AddUniqueConstraintToDevices1746643269769';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_addresses_users"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credentials" DROP CONSTRAINT "fk_provider_credentials_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ALTER COLUMN "user_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "UQ_10c3822c3da11259a121cfe3e41" UNIQUE ("external_ref", "provider_credentials_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_16aac8a9f6f9c1dd6bcb75ec023" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credentials" ADD CONSTRAINT "FK_8c96cd532227fac6d194d14a48b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "provider_credentials" DROP CONSTRAINT "FK_8c96cd532227fac6d194d14a48b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_16aac8a9f6f9c1dd6bcb75ec023"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "UQ_10c3822c3da11259a121cfe3e41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ALTER COLUMN "user_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credentials" ADD CONSTRAINT "fk_provider_credentials_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_addresses_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
