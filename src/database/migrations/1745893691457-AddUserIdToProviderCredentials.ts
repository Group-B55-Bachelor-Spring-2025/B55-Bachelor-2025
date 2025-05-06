import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdToProviderCredentials1745893691457
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE provider_credentials 
      ADD COLUMN user_id INT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE provider_credentials 
      ADD CONSTRAINT fk_provider_credentials_user 
      FOREIGN KEY (user_id) 
      REFERENCES users(id) ON DELETE CASCADE;
    `);

    // Update existing records
    await queryRunner.query(`
      UPDATE provider_credentials 
      SET user_id = 1 
      WHERE user_id IS NULL;
    `);

    // Make the column NOT NULL after updating existing records
    await queryRunner.query(`
      ALTER TABLE provider_credentials 
      ALTER COLUMN user_id SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE provider_credentials 
      DROP CONSTRAINT fk_provider_credentials_user;
    `);

    await queryRunner.query(`
      ALTER TABLE provider_credentials 
      DROP COLUMN user_id;
    `);
  }
}
