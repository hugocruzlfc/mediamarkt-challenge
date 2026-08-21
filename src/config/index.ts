import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  mongodbUri: string;
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
}

export function loadConfig(): Config {
  const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/store-app';
  const port = parseInt(process.env.PORT || '4000', 10);
  const nodeEnv = (process.env.NODE_ENV || 'development') as Config['nodeEnv'];

  if (isNaN(port)) {
    throw new Error('PORT must be a valid number');
  }

  return {
    mongodbUri,
    port,
    nodeEnv,
  };
}
