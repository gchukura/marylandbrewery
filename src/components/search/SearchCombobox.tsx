'use client';

/**
 * Site search with suggestions (WAI-ARIA combobox pattern: list autocomplete, focus stays in the
 * input, aria-activedescendant marks the active option). The index loads on first focus.
 * Enter on a suggestion opens it; otherwise the form searches the map (/map?q=...).
 */
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Landmark, MapPin, Search, Sparkles } from 'lucide-react';
import {
  expandSearchIndex,
  matchSearch,
  type SearchIndex,
  type SearchItem,
  type SearchKind,
} from '@/lib/search-index';
import { cn } from '@/lib/utils';

const ICONS: Record<SearchKind, typeof MapPin> = {
  brewery: Building2,
  city: MapPin,
  county: Landmark,
  amenity: Sparkles,
};

let indexPromise: Promise<SearchItem[]> | null = null;
function loadIndex(): Promise<SearchItem[]> {
  indexPromise ??= fetch('/search-index.json')
    .then((r) =>
      r.ok
        ? (r.json() as Promise<SearchIndex>)
        : Promise.reject(new Error(String(r.status)))
    )
    .then(expandSearchIndex)
    .catch(() => {
      indexPromise = null; // retry on the next focus
      return [];
    });
  return indexPromise;
}

interface SearchComboboxProps {
  placeholder?: string;
  /** Visible button label */
  submitLabel?: string;
  className?: string;
}

export default function SearchCombobox({
  placeholder = 'Brewery, city, county or amenity',
  submitLabel = 'Search',
  className,
}: SearchComboboxProps) {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<SearchItem[]>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const suggestions = useMemo(() => matchSearch(items, query), [items, query]);
  const expanded = open && suggestions.length > 0;

  useEffect(() => setActive(-1), [query]);

  const go = (item: SearchItem) => {
    setOpen(false);
    router.push(item.href);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (expanded && active >= 0) return go(suggestions[active]);
    const q = query.trim();
    setOpen(false);
    router.push(q ? `/map?q=${encodeURIComponent(q)}` : '/map');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setOpen(true);
        setActive((i) =>
          suggestions.length === 0 ? -1 : (i + 1) % suggestions.length
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setOpen(true);
        setActive((i) =>
          suggestions.length === 0
            ? -1
            : i <= 0
              ? suggestions.length - 1
              : i - 1
        );
        break;
      case 'Escape':
        if (expanded) setOpen(false);
        else setQuery('');
        setActive(-1);
        break;
      case 'Home':
      case 'End':
        setActive(-1); // let the caret move
        break;
    }
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn('relative flex flex-wrap gap-2.5', className)}
    >
      <div className="relative flex h-14 min-w-0 flex-[1_1_320px] items-center gap-3 rounded-[12px] border-[1.5px] border-line-strong bg-white px-4 focus-within:border-ink">
        <Search className="h-5 w-5 shrink-0 text-ink" aria-hidden="true" />
        <label htmlFor={`${id}-input`} className="sr-only">
          Search breweries, cities, counties or amenities
        </label>
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="text"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            expanded && active >= 0 ? `${id}-opt-${active}` : undefined
          }
          autoComplete="off"
          enterKeyHint="search"
          value={query}
          placeholder={placeholder}
          onFocus={() => {
            setOpen(true);
            void loadIndex().then(setItems);
          }}
          onBlur={() => setOpen(false)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-base text-ink outline-none placeholder:text-muted"
        />
        <ul
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          hidden={!expanded}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 m-0 max-h-[60vh] list-none overflow-auto rounded-[12px] border border-line bg-white p-1.5 shadow-[0_8px_24px_rgba(20,20,20,0.16)]"
        >
          {suggestions.map((item, i) => {
            const Icon = ICONS[item.kind];
            return (
              <li
                key={item.href}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                // mousedown, not click: keep focus in the input until we navigate
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(item);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 text-left',
                  i === active ? 'bg-cream' : 'bg-white'
                )}
              >
                <Icon
                  className="h-4 w-4 shrink-0 text-muted"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-ink">
                  {item.label}
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {item.detail}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <button
        type="submit"
        className="h-14 rounded-[12px] bg-brand-red px-[26px] text-base font-semibold text-paper hover:bg-brand-red-dark"
      >
        {submitLabel}
      </button>
    </form>
  );
}
