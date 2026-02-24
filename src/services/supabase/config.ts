import { readRuntimeEnv, type RuntimeEnv } from '../../config/env';

export type SupabaseConfig = Pick<RuntimeEnv, 'supabaseUrl' | 'supabaseAnonKey'>;

let cachedConfig: SupabaseConfig | null = null;

export function getSupabaseConfig(): SupabaseConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const runtimeEnv = readRuntimeEnv();
  cachedConfig = {
    supabaseUrl: runtimeEnv.supabaseUrl,
    supabaseAnonKey: runtimeEnv.supabaseAnonKey
  };

  return cachedConfig;
}
