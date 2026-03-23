/**
 * Generate PWA icons
 * Run: node scripts/generate-icons.js
 * Requires: npm install canvas (optional — if not available, use the SVG fallback)
 *
 * Alternative: open generate-icons.html in a browser and save the generated images.
 */

const fs = require('fs');
const path = require('path');

// Simple 1-pixel PNG generator for placeholder (real icons should be designed)
function createMinimalPNG(size) {
  // PNG header + minimal IHDR + IDAT + IEND for a solid colored square
  // This is a proper but very simple approach
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createRadialGradient(size/2, size*0.4, 0, size/2, size/2, size*0.6);
  grad.addColorStop(0, '#3d2b1f');
  grad.addColorStop(1, '#1a0a00');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.16);
  ctx.fill();

  // Rat emoji text
  ctx.font = `${size * 0.5}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🐀', size/2, size * 0.45);

  // Hebrew text
  ctx.font = `900 ${size * 0.11}px sans-serif`;
  ctx.fillStyle = '#ffd700';
  ctx.fillText('גיבורים', size/2, size * 0.82);

  return canvas.toBuffer('image/png');
}

try {
  [192, 512].forEach(size => {
    const buf = createMinimalPNG(size);
    const outPath = path.join(__dirname, '..', 'public', 'icons', `icon-${size}.png`);
    fs.writeFileSync(outPath, buf);
    console.log(`Created ${outPath}`);
  });
} catch (e) {
  console.log('canvas module not available. Using browser-based generation instead.');
  console.log('Open public/icons/generate-icons.html in a browser to create the icons.');
}
