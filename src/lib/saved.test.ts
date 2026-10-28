import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getSaved,
  isSaved,
  resetSavedForTests,
  subscribeSaved,
  toggleSaved,
} from './saved';

// A minimal browser: window with localStorage and storage events
class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  clear() {
    this.data.clear();
  }
}
const storage = new MemoryStorage();
vi.stubGlobal('window', {
  localStorage: storage,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

beforeEach(() => {
  storage.clear();
  resetSavedForTests();
  vi.restoreAllMocks();
});

describe('saved breweries', () => {
  it('toggles, keeps newest first and persists', () => {
    expect(toggleSaved('a')).toBe(true);
    expect(toggleSaved('b')).toBe(true);
    expect(getSaved()).toEqual(['b', 'a']);
    expect(JSON.parse(window.localStorage.getItem('mb:saved')!)).toEqual([
      'b',
      'a',
    ]);
    expect(toggleSaved('a')).toBe(false);
    expect(isSaved('a')).toBe(false);
  });

  it('notifies subscribers', () => {
    const listener = vi.fn();
    const off = subscribeSaved(listener);
    toggleSaved('x');
    expect(listener).toHaveBeenCalledTimes(1);
    off();
    toggleSaved('x');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('works without storage and ignores junk in it', () => {
    window.localStorage.setItem('mb:saved', '{"not":"a list"}');
    expect(getSaved()).toEqual([]);
    resetSavedForTests();
    vi.spyOn(storage, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(toggleSaved('y')).toBe(true);
    expect(isSaved('y')).toBe(true);
  });
});
