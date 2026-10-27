import sharp from 'sharp';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const LOGO_PATH = join(process.cwd(), 'public', 'logo.png');
const OUTPUT_DIR = join(process.cwd(), 'public');

async function splitLogo() {
  try {
    // Check if logo exists
    if (!existsSync(LOGO_PATH)) {
      console.error(`❌ Logo file not found at: ${LOGO_PATH}`);
      process.exit(1);
    }

    console.log('📸 Loading logo image...');
    const image = sharp(LOGO_PATH);
    const metadata = await image.metadata();
    
    if (!metadata.width || !metadata.height) {
      console.error('❌ Could not read image dimensions');
      process.exit(1);
    }

    const width = metadata.width;
    const height = metadata.height;
    
    console.log(`✅ Logo dimensions: ${width}x${height}px`);
    
    // Default split at 60% from top (text is top 60%, beer mug is bottom 40%)
    // User can adjust this percentage
    const splitPercentage = process.argv[2] ? parseFloat(process.argv[2]) : 0.6;
    const splitPoint = Math.floor(height * splitPercentage);
    
    console.log(`✂️  Splitting at ${Math.round(splitPercentage * 100)}% (${splitPoint}px from top)`);
    console.log(`   Text portion: top ${splitPoint}px`);
    console.log(`   Beer mug portion: bottom ${height - splitPoint}px`);
    
    // Extract top portion (text)
    const textPath = join(OUTPUT_DIR, 'logo-text.png');
    await image
      .extract({
        left: 0,
        top: 0,
        width: width,
        height: splitPoint
      })
      .toFile(textPath);
    
    console.log(`✅ Text saved to: logo-text.png (${width}x${splitPoint}px)`);
    
    // Extract bottom portion (beer mug) - reload image for second extraction
    const beerMugPath = join(OUTPUT_DIR, 'logo-beer-mug.png');
    const beerMugHeight = height - splitPoint;
    const image2 = sharp(LOGO_PATH);
    await image2
      .extract({
        left: 0,
        top: splitPoint,
        width: width,
        height: beerMugHeight > 0 ? beerMugHeight : 1
      })
      .toFile(beerMugPath);
    
    console.log(`✅ Beer mug saved to: logo-beer-mug.png (${width}x${beerMugHeight}px)`);
    
    console.log('\n✨ Logo split complete!');
    console.log('📁 Files created:');
    console.log(`   - public/logo-beer-mug.png`);
    console.log(`   - public/logo-text.png`);
    console.log('\n💡 Tip: If the split point needs adjustment, run:');
    console.log(`   npx tsx scripts/split-logo.ts 0.55  (for 55% split)`);
    console.log(`   npx tsx scripts/split-logo.ts 0.65  (for 65% split)`);
    
  } catch (error) {
    console.error('❌ Error splitting logo:', error);
    process.exit(1);
  }
}

splitLogo();

