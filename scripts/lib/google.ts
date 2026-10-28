/**
 * The Google key for scripts. Scripts call Places and Geocoding from a server, so they need their
 * own key: the site's NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is restricted to the site's domains (it ships
 * to every browser), and Google rejects it here with REQUEST_DENIED. Never fall back to it.
 * Setup: docs/setup.md#google-server-key. Check it with `npm run google:check`.
 */

const SERVER_KEY_ENV = 'GOOGLE_MAPS_API_KEY';

const SETUP = `Create a server key (docs/setup.md#google-server-key), put it in .env.local as ${SERVER_KEY_ENV}, then run npm run google:check.`;

export function googleServerKey(): string {
  const key = process.env[SERVER_KEY_ENV]?.trim();
  if (!key) throw new Error(`${SERVER_KEY_ENV} is not set. ${SETUP}`);
  if (key === process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim()) {
    throw new Error(`${SERVER_KEY_ENV} is the site's browser key, which Google rejects from scripts. ${SETUP}`);
  }
  return key;
}

/** The key, or undefined when it isn't set (for scripts where Google is optional). */
export function optionalGoogleServerKey(): string | undefined {
  return process.env[SERVER_KEY_ENV]?.trim() ? googleServerKey() : undefined;
}

/** One line explaining a non-OK legacy Places/Geocoding status. */
export function explainGoogleStatus(status: string, errorMessage?: string): string {
  if (status === 'REQUEST_DENIED') {
    return `REQUEST_DENIED: ${errorMessage ?? ''} The key must allow this API (Places API / Geocoding API) and have no website restriction. ${SETUP}`;
  }
  if (status === 'OVER_QUERY_LIMIT') return 'OVER_QUERY_LIMIT: quota or billing problem in Google Cloud.';
  return `${status}${errorMessage ? `: ${errorMessage}` : ''}`;
}
