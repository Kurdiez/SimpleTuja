import { join } from 'path';
import { register } from 'tsconfig-paths';

// Register TypeScript path aliases before any imports
register({
  baseUrl: join(__dirname, '../..'), // points to src directory
  paths: {
    '~/*': ['./*'],
    '@/*': ['./*'],
  },
});
