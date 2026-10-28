import { readFile } from 'fs/promises';
import { join } from 'path';
import { ImageResponse } from 'next/og';

/**
 * The site-wide social card (opengraph-image and twitter-image): ink ground, checker band top and
 * bottom, the mark, "Maryland Brewery" in Fraunces and a tagline in Inter. Rendered once at build.
 * ImageResponse can't use CSS variables or classes, so colors are the token values from globals.css.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = 'Maryland Brewery: every brewery in Maryland, one map';

const INK = '#141414';
const GOLD = '#EAAA00';
const FLAG_RED = '#E03A3E';
const PAPER = '#FFFDF7';

const TOP = [INK, GOLD, INK, GOLD, FLAG_RED, '#FFFFFF', FLAG_RED, '#FFFFFF'];
const BOTTOM = [GOLD, INK, GOLD, INK, '#FFFFFF', FLAG_RED, '#FFFFFF', FLAG_RED];

function Band({ cells }: { cells: string[] }) {
  return (
    <div style={{ display: 'flex', height: 16, width: '100%' }}>
      {[...cells, ...cells].map((color, i) => (
        // On the ink ground the ink cells need an edge to read as cells
        <div key={i} style={{ flex: 1, background: color === INK ? '#000000' : color }} />
      ))}
    </div>
  );
}

const asset = (path: string) => readFile(join(process.cwd(), path));

export async function brandImage() {
  const [mark, fraunces, inter, interSemiBold] = await Promise.all([
    asset('public/mark.svg'),
    asset('src/assets/fonts/Fraunces-Bold.ttf'),
    asset('src/assets/fonts/Inter-Regular.ttf'),
    asset('src/assets/fonts/Inter-SemiBold.ttf'),
  ]);
  const markSrc = `data:image/svg+xml;base64,${mark.toString('base64')}`;

  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: INK }}>
        <Band cells={TOP} />
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 56, padding: '0 96px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img */}
          <img src={markSrc} width={260} height={260} alt="" style={{ border: `4px solid ${GOLD}`, borderRadius: 999 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 24, letterSpacing: 4, textTransform: 'uppercase', color: GOLD }}>
              Maryland brewery directory
            </div>
            <div style={{ fontFamily: 'Fraunces', fontWeight: 700, fontSize: 92, lineHeight: 1, letterSpacing: -1.5, color: PAPER }}>
              Maryland Brewery
            </div>
            <div style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: 34, lineHeight: 1.35, color: 'rgba(255,253,247,0.8)', maxWidth: 620 }}>
              Every brewery in Maryland, one map. Hours, taprooms, patios and what&apos;s open tonight.
            </div>
          </div>
        </div>
        <Band cells={BOTTOM} />
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Fraunces', data: fraunces, weight: 700, style: 'normal' },
        { name: 'Inter', data: inter, weight: 400, style: 'normal' },
        { name: 'Inter', data: interSemiBold, weight: 600, style: 'normal' },
      ],
    }
  );
}
