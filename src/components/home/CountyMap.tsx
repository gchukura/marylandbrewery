import { readFileSync } from 'fs';
import { join } from 'path';
import Link from 'next/link';
import { countyLabel } from '@/lib/seo/page-meta';
import { slugify } from '@/lib/slug';

/**
 * Interactive Maryland county map: each county with breweries is a focusable link to its county
 * page, shaded cream -> gold by brewery count. Paths come from maryland-counties.svg, generated
 * from Census boundaries by scripts/generate-county-map.ts (npm run map:counties).
 */

interface CountyShape {
  geoid: string;
  /** The app's county name ("Baltimore City", "St. Mary's") */
  name: string;
  d: string;
  /** "evenodd" for counties with holes (Baltimore County around Baltimore City) or several parts */
  fillRule?: 'evenodd' | 'nonzero';
  /** Where to put the count label: the centroid of the largest piece */
  cx: number;
  cy: number;
  /** Area of the largest piece, to skip labels that wouldn't fit */
  area: number;
}

const decode = (s: string) => s.replace(/&apos;/g, "'").replace(/&amp;/g, '&');

function largestPiece(d: string): { cx: number; cy: number; area: number } {
  let best = { cx: 0, cy: 0, area: 0 };
  for (const piece of d.split('M').filter((p) => p.trim())) {
    const nums = piece.replace(/Z/g, '').trim().split(/\s+/).map(Number);
    const pts: [number, number][] = [];
    for (let i = 0; i + 1 < nums.length; i += 2)
      pts.push([nums[i], nums[i + 1]]);
    // Shoelace area and centroid
    let a = 0,
      cx = 0,
      cy = 0;
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % pts.length];
      const cross = x0 * y1 - x1 * y0;
      a += cross;
      cx += (x0 + x1) * cross;
      cy += (y0 + y1) * cross;
    }
    const area = Math.abs(a / 2);
    if (area > best.area && a !== 0)
      best = { cx: cx / (3 * a), cy: cy / (3 * a), area };
  }
  return best;
}

let cache: { viewBox: string; counties: CountyShape[] } | null = null;

function loadShapes() {
  if (cache) return cache;
  const svg = readFileSync(
    join(process.cwd(), 'src/components/home/maryland-counties.svg'),
    'utf8'
  );
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 800 422';
  // Read each <path>'s attributes by name: mapshaper adds fill-rule to some, so order varies
  const counties = [...svg.matchAll(/<path\s([^>]+?)\/?>/g)].map(
    ([, attrs]) => {
      const attr = (name: string) =>
        attrs.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1] ?? '';
      const d = attr('d');
      const label = decode(attr('data-label'));
      return {
        geoid: attr('data-geoid'),
        name:
          label === 'Baltimore city'
            ? 'Baltimore City'
            : decode(attr('data-name')),
        d,
        fillRule:
          attr('fill-rule') === 'evenodd' ? ('evenodd' as const) : undefined,
        ...largestPiece(d),
      };
    }
  );
  if (counties.length !== 24 || counties.some((c) => !c.d || !c.geoid)) {
    throw new Error(
      `maryland-counties.svg: expected 24 complete county paths, got ${counties.length}`
    );
  }
  cache = { viewBox, counties };
  return cache;
}

// Cream -> gold in five steps (tokens: cream #F5EFE0, gold #EAAA00)
const SCALE = ['#F5EFE0', '#F3DFA8', '#F0CF73', '#EDBE3D', '#EAAA00'];
const MIN_LABEL_AREA = 900; // square units of the 800-wide viewBox

function shade(count: number, max: number): string {
  if (count === 0) return SCALE[0];
  return SCALE[
    Math.min(
      SCALE.length - 1,
      1 + Math.floor(((count - 1) / Math.max(1, max - 1)) * (SCALE.length - 1))
    )
  ];
}

const plural = (n: number) => `${n} ${n === 1 ? 'brewery' : 'breweries'}`;

/** `counts` is keyed by county name as stored on breweries ("Frederick", "Baltimore City"). */
export default function CountyMap({
  counts,
}: {
  counts: Record<string, number>;
}) {
  const { viewBox, counties } = loadShapes();
  const countOf = (name: string) => counts[name] ?? 0;
  const max = Math.max(1, ...counties.map((c) => countOf(c.name)));
  const listed = [...counties].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-3">
      <svg
        viewBox={viewBox}
        className="h-auto w-full"
        role="group"
        aria-label="Maryland counties, shaded by number of breweries"
      >
        {counties.map((c) => {
          const count = countOf(c.name);
          const path = (
            <path
              d={c.d}
              fillRule={c.fillRule}
              fill={shade(count, max)}
              stroke="#141414"
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
          );
          if (count === 0) {
            return (
              <g key={c.geoid} aria-hidden="true">
                {path}
              </g>
            );
          }
          return (
            <Link
              key={c.geoid}
              href={`/counties/${slugify(c.name)}/breweries`}
              aria-label={`${countyLabel(c.name)}: ${plural(count)}`}
              className="cursor-pointer outline-none [&>path]:transition-[fill] hover:[&>path]:fill-gold focus-visible:[&>path]:stroke-brand-red focus-visible:[&>path]:[stroke-width:4]"
            >
              <title>{`${countyLabel(c.name)}: ${plural(count)}`}</title>
              {path}
            </Link>
          );
        })}
        {/* Counts on top, where they fit; decorative (each link already says it) */}
        <g
          aria-hidden="true"
          className="pointer-events-none"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          fontSize={13}
          fontWeight={600}
          textAnchor="middle"
        >
          {counties
            .filter((c) => countOf(c.name) > 0 && c.area >= MIN_LABEL_AREA)
            .map((c) => (
              <text key={c.geoid} x={c.cx} y={c.cy + 4.5} fill="#141414">
                {countOf(c.name)}
              </text>
            ))}
        </g>
      </svg>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
        <span className="flex items-center gap-1.5" aria-hidden="true">
          {SCALE.map((color) => (
            <span
              key={color}
              className="h-3 w-5 border border-line-strong"
              style={{ background: color }}
            />
          ))}
        </span>
        <span>Fewer → more breweries. Tap a county.</span>
      </div>
      <details className="text-sm">
        <summary className="tap cursor-pointer font-semibold text-brand-red hover:text-brand-red-dark">
          All counties as a list
        </summary>
        <ul className="mt-3 grid list-none grid-cols-2 gap-x-4 gap-y-1.5 p-0 sm:grid-cols-3">
          {listed.map((c) => {
            const count = countOf(c.name);
            return (
              <li key={c.geoid}>
                {count > 0 ? (
                  <Link
                    href={`/counties/${slugify(c.name)}/breweries`}
                    className="text-ink hover:text-brand-red"
                  >
                    {countyLabel(c.name)}{' '}
                    <span className="text-muted">({count})</span>
                  </Link>
                ) : (
                  <span className="text-muted">
                    {countyLabel(c.name)} (none yet)
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </details>
    </div>
  );
}
