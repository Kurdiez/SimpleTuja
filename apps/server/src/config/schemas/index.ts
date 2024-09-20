import { z } from 'zod';
import { databaseConfigSchema } from './database';
import { ApiEnvironment } from '../types';

// const isDevEnv = process.env.ENVIRONMENT === ApiEnvironment.Development;
// const isProdEnv = process.env.ENVIRONMENT === ApiEnvironment.Production;

export const configSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    API_ENV: z
      .enum([
        ApiEnvironment.Development,
        ApiEnvironment.Staging,
        ApiEnvironment.Production,
      ])
      .default(ApiEnvironment.Development),
    PORT: z.coerce.number().int().positive().default(3000),
    ADMIN_SECRET: z.string(),
    NFTFI_API_KEY: z.string(),
    CRYPTO_ACCOUNT_PRIVATE_KEY: z.string(),
    PROVIDER_URL: z.string(),
  })
  .merge(databaseConfigSchema)
  .strip();

export type Config = z.infer<typeof configSchema>;

export { databaseConfigSchema };
