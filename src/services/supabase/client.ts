import { getSupabaseConfig } from './config';
import type { SupabaseLikeClient } from '../auth/supabasePhoneOtp';

export type SupabaseClientFactory = (url: string, anonKey: string) => SupabaseLikeClient;

let factory: SupabaseClientFactory | null = null;
let cachedClient: SupabaseLikeClient | null = null;

export function setSupabaseClientFactory(nextFactory: SupabaseClientFactory): void {
  factory = nextFactory;
  cachedClient = null;
}

export function getSupabaseClient(): SupabaseLikeClient {
  if (cachedClient) {
    return cachedClient;
  }

  if (!factory) {
    throw new Error(
      'Supabase client factory is not configured. Call setSupabaseClientFactory() during app bootstrap.'
    );
  }

  const config = getSupabaseConfig();
  cachedClient = factory(config.supabaseUrl, config.supabaseAnonKey);
  return cachedClient;
}

export function resetSupabaseClientForTests(): void {
  factory = null;
  cachedClient = null;
}
