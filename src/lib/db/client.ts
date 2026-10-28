/**
 * Supabase clients, typed with the generated schema (database.types.ts).
 * Regenerate the types after a migration: npm run db:types
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export type { Database, Json, Tables, TablesInsert, TablesUpdate } from './database.types';

export type TypedClient = SupabaseClient<Database>;

const serverAuth = { autoRefreshToken: false, persistSession: false };

let anonClient: TypedClient | undefined;
let adminClient: TypedClient | undefined;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing Supabase environment variables. Please set ${name} (see .env.example).`);
  }
  return value;
}

/** Read-only client (anon key, row-level security applies). */
export function getSupabase(): TypedClient {
  anonClient ??= createClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    { auth: serverAuth }
  );
  return anonClient;
}

/**
 * Service-role client for writes. Throws when SUPABASE_SERVICE_ROLE_KEY is missing, so a script
 * fails at the first write with a clear message.
 */
export function getAdminClient(): TypedClient {
  adminClient ??= createClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: serverAuth }
  );
  return adminClient;
}
