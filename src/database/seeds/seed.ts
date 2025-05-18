import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

config();

async function main() {
  console.log('Starting the database seeding process...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    // Seed the Mill provider
    console.log('Seeding Mill provider...');
    const existingProvider = await dataSource.query(
      'SELECT * FROM providers WHERE name = $1',
      ['mill'],
    );

    if (existingProvider.length === 0) {
      await dataSource.query(
        'INSERT INTO providers (name, api_base_url, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        ['mill', 'https://api.millnorwaycloud.com'],
      );
      console.log('Mill provider successfully added');
    } else {
      console.log('Mill provider already exists, skipping');
    }

    // Seed the admin user
    console.log('Seeding admin user...');
    const existingAdminUser = await dataSource.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@example.com'],
    );

    if (existingAdminUser.length === 0) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      await dataSource.query(
        'INSERT INTO users (name, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
        ['Admin User', 'admin@example.com', adminPassword, 'admin'],
      );
      console.log('Admin user successfully added');
    } else {
      console.log('Admin user already exists, skipping');
    }

    // Seed the regular user
    console.log('Seeding regular user...');
    const existingRegularUser = await dataSource.query(
      'SELECT * FROM users WHERE email = $1',
      ['user@example.com'],
    );

    if (existingRegularUser.length === 0) {
      const userPassword = await bcrypt.hash('user123', 10);
      await dataSource.query(
        'INSERT INTO users (name, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
        ['Normal User', 'user@example.com', userPassword, 'user'],
      );
      console.log('Regular user successfully added');
    } else {
      console.log('Regular user already exists, skipping');
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error occurred during seeding:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error during seeding:', error);
    process.exit(1);
  });
