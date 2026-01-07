// lib/env.ts
function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];
  if (required && !value) {
    // In development, provide more helpful error message
    if (process.env.NODE_ENV === 'development') {
      throw new Error(
        `Missing required environment variable: ${key}\n` +
        `Please check your .env file or create one from .env.example`
      );
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

export const env = {
  database: {
    url: getEnvVar('DATABASE_URL'),
    directUrl: getEnvVar('DIRECT_URL', false) || getEnvVar('DATABASE_URL'),
  },
  supabase: {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  },
  pi: {
    apiUrl: getEnvVar('PI_API_URL', false) || 'https://api.minepi.com/v2',
    apiKey: getEnvVar('PI_API_KEY'),
    apiSecret: getEnvVar('PI_API_SECRET', false),
    sandbox: getEnvVar('NEXT_PUBLIC_PI_SANDBOX') === 'true',
  },
  app: {
    url: getEnvVar('NEXT_PUBLIC_APP_URL'),
    nodeEnv: getEnvVar('NODE_ENV', false) || 'development',
  },
};
