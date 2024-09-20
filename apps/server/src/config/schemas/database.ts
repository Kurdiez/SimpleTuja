import { z } from 'zod';

export const databaseConfigSchema = z.object({
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_HOST: z.string(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string().default('postgres'),
});
