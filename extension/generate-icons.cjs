const fs = require('fs');
const path = require('path');

const distIcons = path.join(__dirname, 'dist', 'icons');

// Create icons directory
if (!fs.existsSync(distIcons)) {
  fs.mkdirSync(distIcons, { recursive: true });
}

// Minimal 1x1 transparent PNG (base64)
const minimalPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Write icon files
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const iconPath = path.join(distIcons, `icon${size}.png`);
  fs.writeFileSync(iconPath, minimalPNG);
  console.log(`Created icon${size}.png`);
});

console.log('Icons generated successfully!');
