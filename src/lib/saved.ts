/**
 * Saved breweries: slugs in localStorage. Storage can be missing or throw (private windows,
 * blocked site data), so every access is guarded and the in-memory copy keeps working for the
 * current visit. Components subscribe to changes, including from other tabs.
 */
const KEY = 'mb:saved';
const MAX = 200;

let memory: string[] | null = null;
const listeners = new Set<() => void>();

function read(): string[] {
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    memory = Array.isArray(parsed)
      ? parsed.filter((s): s is string => typeof s === 'string').slice(0, MAX)
      : [];
  } catch {
    memory = [];
  }
  return memory;
}

function write(slugs: string[]) {
  memory = slugs.slice(0, MAX);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    // Storage unavailable: keep the in-memory list for this visit
  }
  listeners.forEach((l) => l());
}

export function getSaved(): string[] {
  return typeof window === 'undefined' ? [] : read();
}

export function isSaved(slug: string): boolean {
  return getSaved().includes(slug);
}

/** Save or unsave; returns the new state. Newest first. */
export function toggleSaved(slug: string): boolean {
  const current = getSaved();
  const saved = !current.includes(slug);
  write(saved ? [slug, ...current] : current.filter((s) => s !== slug));
  return saved;
}

export function subscribeSaved(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    memory = null; // another tab changed it
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** For tests */
export function resetSavedForTests() {
  memory = null;
}
