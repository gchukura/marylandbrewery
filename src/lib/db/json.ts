/**
 * Narrow Supabase Json columns to the shapes the app uses. JSONB columns are typed Json by the
 * generator; these are the only places their contents are trusted to have a given shape.
 */
import type { Json } from './database.types';

type JsonValue = Json | null | undefined;

/** A JSON array of strings; anything else (or non-string items) is dropped. */
export function jsonStringArray(value: JsonValue): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/** A JSON object, trusted to have shape T (e.g. hours keyed by day). */
export function jsonObject<T extends object>(value: JsonValue): T | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as unknown as T) : undefined;
}

/** A JSON array of objects, trusted to have shape T. */
export function jsonArray<T extends object>(value: JsonValue): T[] {
  return Array.isArray(value) ? (value.filter((item) => item !== null && typeof item === 'object') as unknown as T[]) : [];
}

/** A typed object written to a JSONB column (e.g. review_themes). It must be JSON-serializable. */
export function toJson<T extends object>(value: T): Json {
  return value as unknown as Json;
}
