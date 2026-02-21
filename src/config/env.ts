type AppEnv = 'development' | 'staging' | 'production';

export type RuntimeEnv = {
  appEnv: AppEnv;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

const appEnvRaw = process.env.EXPO_PUBLIC_APP_ENV?.trim().toLowerCase();

const APP_ENV_MAP: Record<string, AppEnv> = {
  dev: 'development',
  development: 'development',
  stage: 'staging',
  staging: 'staging',
  prod: 'production',
  production: 'production'
};

function normalizeAppEnv(raw?: string): AppEnv {
  if (!raw) {
    return 'development';
  }

  return APP_ENV_MAP[raw] ?? 'development';
}

function getRequiredExpoPublicEnv(key: string): string {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function readRuntimeEnv(): RuntimeEnv {
  return {
    appEnv: normalizeAppEnv(appEnvRaw),
    supabaseUrl: getRequiredExpoPublicEnv('EXPO_PUBLIC_SUPABASE_URL'),
    supabaseAnonKey: getRequiredExpoPublicEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY')
  };
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}
