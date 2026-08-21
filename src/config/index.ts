import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  mongodbUri: z
    .url('MONGODB_URI must be a valid MongoDB connection URL')
    .default('mongodb://localhost:27017/store-app'),
  port: z.coerce.number().int('PORT must be an integer').min(1).max(65535).default(4000),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  const parsed = configSchema.safeParse({
    mongodbUri: process.env.MONGODB_URI,
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    parsed.error.issues.forEach((issue) => {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });
    throw new Error('Configuration validation failed');
  }

  return parsed.data;
}
