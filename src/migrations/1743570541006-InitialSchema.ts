import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1743570541006 implements MigrationInterface {
  name = 'InitialSchema1743570541006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "regions" ("code" character varying(10) NOT NULL, "country_code" character varying(2) NOT NULL, "name" character varying(100) NOT NULL, "eic_code" character varying(20) NOT NULL, "active" boolean, CONSTRAINT "UQ_f640810a579cc4945338089cb94" UNIQUE ("eic_code"), CONSTRAINT "PK_4f6dc5a464961e7c65a395ea4c6" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "addresses" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "address" character varying(200) NOT NULL, "city" character varying(100) NOT NULL, "zip_code" character varying(20) NOT NULL, "country" character varying(100) NOT NULL, "region_code" character varying(10) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "providers" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "api_base_url" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_af13fc2ebf382fe0dad2e4793aa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_credentials" ("id" SERIAL NOT NULL, "provider_id" integer NOT NULL, "access_token" text NOT NULL, "refresh_token" text, "expires_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_31f2884572a5fef8e25a08b5a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "devices" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "type" character varying(50) NOT NULL, "device_group_id" integer, "provider_credentials_id" integer, "settings" text, "external_ref" character varying(100) NOT NULL, "status" character varying(50), "last_sync" TIMESTAMP, "exclude_smart_ctrl" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "smart_control_settings" ("id" SERIAL NOT NULL, "device_group_id" integer NOT NULL, "enabled" boolean NOT NULL DEFAULT true, "temperature_offset" integer, "energy_savings_percentage" integer, "night_shift_enabled" boolean NOT NULL DEFAULT false, "night_shift_start" TIMESTAMP, "night_shift_duration" integer, "night_shift_saving_percentage" integer, "day_of_week" integer, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_54836828cd55d4d5fd9bae21fee" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "device_groups" ("id" SERIAL NOT NULL, "address_id" integer NOT NULL, "name" character varying(100) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0a85eb3da91cda682e08b66ae77" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_65de8848093e21634b955ccd04d" FOREIGN KEY ("region_code") REFERENCES "regions"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credentials" ADD CONSTRAINT "FK_f642f9a5c8c811ca8283e2766fb" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_6937bfd1306ed0436aba9e84066" FOREIGN KEY ("device_group_id") REFERENCES "device_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ADD CONSTRAINT "FK_85724142693fe28731cf4722753" FOREIGN KEY ("provider_credentials_id") REFERENCES "provider_credentials"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "smart_control_settings" ADD CONSTRAINT "FK_090c286c49022b55f5affd0d1cb" FOREIGN KEY ("device_group_id") REFERENCES "device_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_groups" ADD CONSTRAINT "FK_7107eb5c943b3fabf2a40db12e8" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "device_groups" DROP CONSTRAINT "FK_7107eb5c943b3fabf2a40db12e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "smart_control_settings" DROP CONSTRAINT "FK_090c286c49022b55f5affd0d1cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_85724142693fe28731cf4722753"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" DROP CONSTRAINT "FK_6937bfd1306ed0436aba9e84066"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credentials" DROP CONSTRAINT "FK_f642f9a5c8c811ca8283e2766fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_65de8848093e21634b955ccd04d"`,
    );
    await queryRunner.query(`DROP TABLE "device_groups"`);
    await queryRunner.query(`DROP TABLE "smart_control_settings"`);
    await queryRunner.query(`DROP TABLE "devices"`);
    await queryRunner.query(`DROP TABLE "provider_credentials"`);
    await queryRunner.query(`DROP TABLE "providers"`);
    await queryRunner.query(`DROP TABLE "addresses"`);
    await queryRunner.query(`DROP TABLE "regions"`);
  }
}
