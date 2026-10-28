/**
 * Logo assets from docs/design/mark.svg (the design source). Re-run after the mark changes:
 *
 *   npm run icons
 *
 * Writes:
 *   public/mark.svg                     svgo-optimized mark, used by <Logo>
 *   src/app/favicon.ico                 16, 32 and 48 px (PNG-in-ICO)
 *   src/app/icon.png                    192 px, transparent
 *   src/app/apple-icon.png              180 px on paper (iOS fills transparency with black)
 *   public/icon-192.png, icon-512.png   for public/manifest.json
 * The 16 px icon is the mark as-is, without simplification.
 */
import { readFileSync, writeFileSync } from 'fs';
import sharp from 'sharp';
import { optimize } from 'svgo';

const SOURCE = 'docs/design/mark.svg';
const PAPER = '#FFFDF7';

/** Render the mark at `size` px. `padding` is a fraction of the size left around it. */
async function png(svg: Buffer, size: number, { background, padding = 0 }: { background?: string; padding?: number } = {}): Promise<Buffer> {
  const inner = Math.round(size * (1 - 2 * padding));
  // Rasterize at a high density so small sizes are downsampled, not drawn at low resolution
  const mark = await sharp(svg, { density: Math.max(72, Math.ceil((inner / 100) * 72 * 4)) })
    .resize(inner, inner)
    .png()
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: background ?? { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: mark, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** ICO container holding PNG images (supported by every current browser). */
function ico(images: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  const entries: Buffer[] = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette colors
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

async function main() {
  const source = readFileSync(SOURCE, 'utf8');
  const { data: optimized } = optimize(source, {
    multipass: true,
    plugins: [
      // Keep viewBox (needed for scaling) and the accessible name
      { name: 'preset-default', params: { overrides: { removeUnknownsAndDefaults: { keepRoleAttr: true } } } },
    ],
  });
  writeFileSync('public/mark.svg', optimized);
  const svg = Buffer.from(optimized);

  const icoSizes = [16, 32, 48];
  writeFileSync('src/app/favicon.ico', ico(await Promise.all(icoSizes.map(async (size) => ({ size, data: await png(svg, size) })))));
  writeFileSync('src/app/icon.png', await png(svg, 192));
  writeFileSync('src/app/apple-icon.png', await png(svg, 180, { background: PAPER, padding: 0.1 }));
  writeFileSync('public/icon-192.png', await png(svg, 192));
  writeFileSync('public/icon-512.png', await png(svg, 512));

  console.log(`public/mark.svg: ${source.length} -> ${optimized.length} bytes`);
  console.log('Wrote src/app/favicon.ico (16/32/48), icon.png, apple-icon.png, public/icon-192.png, icon-512.png');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
