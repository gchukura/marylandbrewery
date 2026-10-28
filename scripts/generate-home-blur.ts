/**
 * Fills in blurDataURL for every hero photo in src/config/home.ts (a 16px-wide blurred WebP as a
 * data URL), so next/image can show it while the photo loads. Run after editing HERO_PHOTOS:
 *
 *   npm run home:blur
 */
import { readFileSync, writeFileSync } from 'fs';
import sharp from 'sharp';
import { HERO_PHOTOS } from '../src/config/home';

const FILE = 'src/config/home.ts';

async function main() {
  let source = readFileSync(FILE, 'utf8');
  for (const photo of HERO_PHOTOS) {
    const res = await fetch(photo.src);
    if (!res.ok) throw new Error(`${photo.src}: HTTP ${res.status}`);
    const tiny = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(16)
      .blur(1)
      .webp({ quality: 40 })
      .toBuffer();
    const dataUrl = `data:image/webp;base64,${tiny.toString('base64')}`;
    // Replace the blurDataURL that follows this photo's src
    const at = source.indexOf(`'${photo.src}'`);
    if (at < 0) throw new Error(`couldn't find ${photo.src} in ${FILE}`);
    const field = /blurDataURL: '[^']*'/.exec(source.slice(at));
    if (!field) throw new Error(`no blurDataURL after ${photo.src}`);
    const start = at + field.index;
    source =
      source.slice(0, start) +
      `blurDataURL: '${dataUrl}'` +
      source.slice(start + field[0].length);
    console.log(`${photo.breweryName}: ${dataUrl.length} chars`);
  }
  writeFileSync(FILE, source);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
