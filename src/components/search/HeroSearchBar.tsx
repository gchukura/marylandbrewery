"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, XCircle } from 'lucide-react';

interface SuggestBrewery { type: 'brewery'; id: string; name: string; city: string }
interface SuggestCity { type: 'city'; name: string; count: number }
interface SuggestAmenity { type: 'amenity'; name: string }

type SuggestItem = SuggestBrewery | SuggestCity | SuggestAmenity;

const RECENT_KEY = 'hero_recent_searches';

export default function HeroSearchBar() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SuggestItem[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const recent = useMemo<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [open]);

  const saveRecent = useCallback((term: string) => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      const next = [term, ...arr.filter(x => x.toLowerCase() !== term.toLowerCase())].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const fetchSuggest = useCallback(async (term: string) => {
    setLoading(true);
    try {
      const url = term ? `/api/suggest?q=${encodeURIComponent(term)}&limit=6` : `/api/suggest?limit=6`;
      const res = await fetch(url);
      const data = await res.json();
      const merged: SuggestItem[] = [
        ...(data.breweries || []),
        ...(data.cities || []),
        ...(data.amenities || []),
      ];
      setItems(merged);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => fetchSuggest(q), 150);
    return () => clearTimeout(id);
  }, [q, fetchSuggest]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter') {
      const item = items[highlight];
      if (item) {
        if (item.type === 'brewery') {
          saveRecent(item.name);
          window.location.href = `/breweries/${(item as any).slug || item.id}`;
        } else if (item.type === 'city') {
          saveRecent(item.name);
          window.location.href = `/city/${item.name.toLowerCase().replace(/\s+/g, '-')}/breweries`;
        } else if (item.type === 'amenity') {
          saveRecent(item.name);
          window.location.href = `/breweries/${item.name.toLowerCase().replace(/\s+/g, '-')}`;
        }
      }
    }
  };

  const highlightMatch = (text: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="bg-yellow-200">{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="relative">
        <div className="flex items-center gap-2 h-14 sm:h-12 border rounded-btn px-3 shadow-sm focus-within:shadow-md transition-shadow">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search breweries, cities, or features..."
            className="flex-1 text-[18px] outline-none focus:ring-2 focus:ring-md-red"
          />
          {q && (
            <button
              aria-label="Clear"
              className="text-gray-400 hover:text-gray-600"
              onClick={() => { setQ(''); inputRef.current?.focus(); }}
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>

        {open && (
          <div
            ref={listRef}
            className="absolute z-20 mt-2 w-full bg-white border rounded-md shadow-lg max-h-[400px] overflow-auto"
          >
            {loading && <div className="p-3 text-sm text-gray-500">Loading…</div>}
            {!loading && items.length === 0 && (
              <div className="p-3 text-sm text-gray-500">
                {recent.length > 0 ? 'Recent searches:' : 'No results'}
                {recent.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button key={r} className="px-2 py-1 border rounded text-sm hover:bg-gray-50" onClick={() => setQ(r)}>
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!loading && items.map((item, idx) => (
              <div
                key={(item as any).id || `${item.type}-${(item as any).name}-${idx}`}
                className={`px-3 py-2 cursor-pointer ${idx === highlight ? 'bg-gray-100' : ''}`}
                onMouseEnter={() => setHighlight(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (item.type === 'brewery') {
                    saveRecent(item.name);
                    window.location.href = `/breweries/${(item as any).slug || item.id}`;
                  } else if (item.type === 'city') {
                    saveRecent(item.name);
                    window.location.href = `/city/${item.name.toLowerCase().replace(/\s+/g, '-')}/breweries`;
                  } else if (item.type === 'amenity') {
                    saveRecent(item.name);
                    window.location.href = `/breweries/${item.name.toLowerCase().replace(/\s+/g, '-')}`;
                  }
                }}
              >
                {item.type === 'brewery' && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-900">{highlightMatch(item.name)}</div>
                    <div className="text-xs text-gray-500 ml-3">{item.city}</div>
                  </div>
                )}
                {item.type === 'city' && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-900">{highlightMatch(item.name)}</div>
                    <div className="text-xs text-gray-500 ml-3">{item.count} breweries</div>
                  </div>
                )}
                {item.type === 'amenity' && (
                  <div className="text-sm text-gray-900">{highlightMatch(item.name)}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
