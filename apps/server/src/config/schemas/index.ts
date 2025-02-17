import { z } from 'zod';
import { Environment } from '../types';
import { databaseConfigSchema } from './database';

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
    APP_URL: z.string(),
    PORT: z.coerce.number().int().positive().default(3000),
    ADMIN_SECRET: z.string(),
    NFTFI_API_KEY: z.string(),
    INFURA_PROJECT_ID: z.string(),
    PROVIDER_URL: z.string(),
    SENTRY_DSN: z.string(),
    OPENSEA_API_KEY: z.string(),
    JWT_SECRET: z.string(),
    BREVO_API_KEY: z.string(),
    NUM_LENDING_ELIGIBLE_NFT_COLLECTIONS: z
      .number()
      .int()
      .positive()
      .default(30),
    COINLAYER_API_KEY: z.string(),
    IG_DEMO_API_KEY: z.string(),
    IG_DEMO_API_BASE_URL: z.string(),
    IG_DEMO_LOGIN_USERNAME: z.string(),
    IG_DEMO_LOGIN_PASSWORD: z.string(),
    IG_LIVE_API_KEY: z.string(),
    IG_LIVE_API_BASE_URL: z.string(),
    IG_LIVE_LOGIN_USERNAME: z.string(),
    IG_LIVE_LOGIN_PASSWORD: z.string(),
    GEMINI_AI_API_KEY: z.string(),
  })
  .merge(databaseConfigSchema)
  .strip();

export type Config = z.infer<typeof configSchema>;

export { databaseConfigSchema };
