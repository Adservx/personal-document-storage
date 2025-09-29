const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create a simple PNG icon programmatically
async function generateIcon(size) {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="${size * 0.2}" fill="url(#grad)"/>
      <rect x="${size * 0.2}" y="${size * 0.3}" width="${size * 0.6}" height="${size * 0.15}" rx="${size * 0.02}" fill="white"/>
      <rect x="${size * 0.2}" y="${size * 0.5}" width="${size * 0.4}" height="${size * 0.08}" rx="${size * 0.01}" fill="white" opacity="0.8"/>
      <rect x="${size * 0.2}" y="${size * 0.62}" width="${size * 0.3}" height="${size * 0.08}" rx="${size * 0.01}" fill="white" opacity="0.6"/>
    </svg>
  `;

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  try {
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, `icon-${size}x${size}.png`));
    
    console.log(`Generated icon-${size}x${size}.png`);
  } catch (error) {
    console.error(`Error generating ${size}x${size} icon:`, error);
  }
}

async function generateAllIcons() {
  console.log('Generating PWA icons...');
  
  const sizes = [192, 512];
  
  for (const size of sizes) {
    await generateIcon(size);
  }
  
  console.log('All icons generated successfully!');
}

// Check if sharp is available
try {
  require.resolve('sharp');
  generateAllIcons();
} catch (error) {
  console.log('Sharp not available. Creating fallback icons...');
  
  // Create simple fallback SVG-based icons (convert to PNG manually or use online tools)
  const fallbackNotice = `
⚠️  PWA Icons needed!

To enable the "Add to Home Screen" prompt, you need PNG icons:

1. Create icon-192x192.png (192x192 pixels)
2. Create icon-512x512.png (512x512 pixels)

Place these files in the public/ directory.

You can:
- Use an online SVG to PNG converter
- Use image editing software
- Install Sharp: npm install sharp
- Then run: node scripts/generate-icons.js

The icons should be solid colors (not transparent) for best compatibility.
  `;
  
  console.log(fallbackNotice);
}
