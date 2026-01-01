/**
 * Script to generate PWA icons from app.jpg
 * 
 * Requirements:
 * - Install sharp: npm install --save-dev sharp
 * - Run: node scripts/generate-icons.js
 * 
 * This will create all required icon sizes in public/icons/
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceImage = path.join(__dirname, '../public/app.jpg');
const outputDir = path.join(__dirname, '../public/icons');

// Required icon sizes for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  try {
    // Check if source image exists
    if (!fs.existsSync(sourceImage)) {
      console.error('Error: app.jpg not found in public/ directory');
      process.exit(1);
    }

    // Create icons directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('Generating PWA icons from app.jpg...\n');

    // Generate each icon size
    for (const size of iconSizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 82, g: 21, b: 64, alpha: 1 } // Brand color #521540
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated icon-${size}x${size}.png`);
    }

    // Also create favicon.ico (using 32x32)
    const faviconPath = path.join(__dirname, '../public/favicon.ico');
    await sharp(sourceImage)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 82, g: 21, b: 64, alpha: 1 }
      })
      .png()
      .toFile(faviconPath.replace('.ico', '.png'));

    console.log('\n✓ All icons generated successfully!');
    console.log('\nNote: favicon.ico needs to be converted manually or use a tool like:');
    console.log('https://convertio.co/png-ico/');
    
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
