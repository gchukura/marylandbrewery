import sharp from 'sharp';
import { existsSync } from 'fs';
import { join } from 'path';

const BEER_MUG_PATH = join(process.cwd(), 'public', 'logo-beer-mug.png');
const OUTPUT_PATH = join(process.cwd(), 'public', 'logo.png');

async function combineLogoWithText() {
  try {
    // Check if beer mug exists
    if (!existsSync(BEER_MUG_PATH)) {
      console.error(`❌ Beer mug image not found at: ${BEER_MUG_PATH}`);
      console.error('   Please save your beer mug image as: public/logo-beer-mug.png');
      process.exit(1);
    }

    console.log('📸 Loading beer mug image...');
    const beerMug = sharp(BEER_MUG_PATH);
    const metadata = await beerMug.metadata();
    
    if (!metadata.width || !metadata.height) {
      console.error('❌ Could not read beer mug image dimensions');
      process.exit(1);
    }

    const mugWidth = metadata.width;
    const mugHeight = metadata.height;
    
    console.log(`✅ Beer mug dimensions: ${mugWidth}x${mugHeight}px`);
    
    // Create text portion - positioned to the right of the beer mug
    // Text height should match the beer mug height for alignment
    const textWidth = Math.floor(mugWidth * 2.5); // Text area width
    const textHeight = mugHeight; // Match beer mug height
    
    // Create SVG for text portion
    const textSvg = `
      <svg width="${textWidth}" height="${textHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#9B2335"/>
        <text 
          x="10" 
          y="50%" 
          font-family="'Source Sans 3', sans-serif" 
          font-size="${Math.floor(mugHeight * 0.35)}px" 
          fill="white" 
          dominant-baseline="middle"
        >
          <tspan font-weight="bold" font-size="${Math.floor(mugHeight * 0.4)}px">MarylandBrewery</tspan>
          <tspan font-weight="normal" font-size="${Math.floor(mugHeight * 0.25)}px">.com</tspan>
        </text>
      </svg>
    `;
    
    console.log('📝 Creating text portion...');
    const textBuffer = Buffer.from(textSvg);
    const textImage = sharp(textBuffer).resize(textWidth, textHeight);
    
    // Combine beer mug (left) with text (right)
    const totalWidth = mugWidth + textWidth;
    const totalHeight = mugHeight; // Height matches the taller of the two (should be same)
    
    console.log('🔗 Combining beer mug and text...');
    const combined = await sharp({
      create: {
        width: totalWidth,
        height: totalHeight,
        channels: 4,
        background: { r: 155, g: 35, b: 53, alpha: 1 } // #9B2335
      }
    })
    .composite([
      { input: await beerMug.toBuffer(), top: 0, left: 0 },
      { input: await textImage.toBuffer(), top: 0, left: mugWidth }
    ])
    .png()
    .toFile(OUTPUT_PATH);
    
    console.log(`\n✨ Combined logo created!`);
    console.log(`📁 Saved to: public/logo.png (${totalWidth}x${totalHeight}px)`);
    console.log(`\n💡 The new logo combines:`);
    console.log(`   - Beer mug (left): ${mugWidth}x${mugHeight}px`);
    console.log(`   - Text "MarylandBrewery.com" (right): ${textWidth}x${textHeight}px`);
    
  } catch (error) {
    console.error('❌ Error combining logo:', error);
    process.exit(1);
  }
}

combineLogoWithText();

