import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

// Load environment variables
config();

let container: StartedPostgreSqlContainer;

export async function setupTestDatabase() {
  console.log('🔵 Starting test database setup...');
  try {
    // Start PostgreSQL container
    console.log('🔵 Creating PostgreSQL container...');
    container = await new PostgreSqlContainer()
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_password')
      .withExposedPorts(5432)
      .start();
    console.log('✅ Container started successfully');

    const entitiesPath = join(__dirname, '../../**/*.entity{.ts,.js}');
    const migrationsPath = join(
      process.cwd(),
      'src/database/migrations/db/*{.ts,.js}',
    );

    console.log('📁 Entities path:', entitiesPath);
    console.log('📁 Migrations path:', migrationsPath);

    // Create TypeORM data source
    console.log('🔵 Creating TypeORM data source...');
    const dataSource = new DataSource({
      type: 'postgres',
      host: container.getHost(),
      port: container.getMappedPort(5432),
      username: container.getUsername(),
      password: container.getPassword(),
      database: container.getDatabase(),
      entities: [entitiesPath],
      synchronize: false,
      migrations: [migrationsPath],
      migrationsRun: false,
      logging: ['migration', 'error'],
    });

    // Initialize connection
    console.log('🔵 Initializing database connection...');
    await dataSource.initialize();
    console.log('✅ Database connection initialized');

    // Run migrations
    console.log('🔵 Running migrations...');
    await dataSource.runMigrations({ transaction: 'all' });
    console.log('✅ Migrations completed');

    await dataSource.destroy();

    return { container };
  } catch (error) {
    console.error('❌ Error during database setup:', error);
    throw error;
  }
}

export async function teardownTestDatabase() {
  console.log('🔵 Starting test database teardown...');
  if (container) {
    await container.stop();
    console.log('✅ Container stopped');
  }
}

export { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
