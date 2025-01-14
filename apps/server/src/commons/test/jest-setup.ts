import './jest-setup-env';
import { setupTestDatabase } from './test-db';

export default async () => {
  const { container } = await setupTestDatabase();

  // Set environment variables for database connection for testing child processes to use
  process.env.STJ_TEST_DB_HOST = container.getHost();
  process.env.STJ_TEST_DB_PORT = container.getMappedPort(5432).toString();
  process.env.STJ_TEST_DB_USERNAME = container.getUsername();
  process.env.STJ_TEST_DB_PASSWORD = container.getPassword();
  process.env.STJ_TEST_DB_DATABASE = container.getDatabase();
};
