import { z } from 'zod';
import { databaseConfigSchema } from './database';
import { Environment } from '../types';

export const configSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    ENVIRONMENT: z
      .enum([
        Environment.Development,
        Environment.Staging,
        Environment.Production,
      ])
      .default(Environment.Development),
    PORT: z.coerce.number().int().positive().default(3000),
    ADMIN_SECRET: z.string(),
    NFTFI_API_KEY: z.string(),
    CRYPTO_ACCOUNT_PRIVATE_KEY: z.string(),
    PROVIDER_URL: z.string(),
    SENTRY_DSN: z.string(),
    OPENSEA_API_KEY: z.string(),
  })
  .merge(databaseConfigSchema)
  .strip();

export type Config = z.infer<typeof configSchema>;

export { databaseConfigSchema };
