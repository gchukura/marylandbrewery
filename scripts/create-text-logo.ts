import sharp from 'sharp';
import { join } from 'path';

const OUTPUT_PATH = join(process.cwd(), 'public', 'logo.png');

async function createTextLogo() {
  try {
    // Create text-only logo with "MarylandBrewery.com"
    // Using Source Sans 3 font (from design system)
    const logoWidth = 600;
    const logoHeight = 150;
    
    // Create SVG for text logo
    const textSvg = `
      <svg width="${logoWidth}" height="${logoHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#9B2335"/>
        <text 
          x="50%" 
          y="50%" 
          font-family="'Source Sans 3', sans-serif" 
          font-size="48px" 
          font-weight="normal"
          fill="white" 
          text-anchor="middle" 
          dominant-baseline="middle"
        >
          MarylandBrewery.com
        </text>
      </svg>
    `;
    
    console.log('📝 Creating text-only logo...');
    const textBuffer = Buffer.from(textSvg);
    
    await sharp(textBuffer)
      .resize(logoWidth, logoHeight)
      .png()
      .toFile(OUTPUT_PATH);
    
    console.log(`\n✨ Text-only logo created!`);
    console.log(`📁 Saved to: public/logo.png (${logoWidth}x${logoHeight}px)`);
    console.log(`\n💡 Logo details:`);
    console.log(`   - Text: "MarylandBrewery.com"`);
    console.log(`   - Font: Source Sans 3 (from design system)`);
    console.log(`   - Font weight: normal (uniform)`);
    console.log(`   - Font size: 48px (uniform)`);
    console.log(`   - Background: Maryland red (#9B2335)`);
    
  } catch (error) {
    console.error('❌ Error creating text logo:', error);
    process.exit(1);
  }
}

createTextLogo();

