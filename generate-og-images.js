/**
 * Script to generate OG images for OMA Sénégal
 * 
 * This script creates placeholder OG images in WebP format
 * that can be later replaced with professionally designed ones
 */

const fs = require('fs');
const path = require('path');

// Create directory if it doesn't exist
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Simple SVG template for OG image
const createOGImageSVG = () => `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#030213"/>
    </linearGradient>
  </defs>
  
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Logo placeholder -->
  <rect x="540" y="100" width="120" height="120" rx="24" fill="white"/>
  <text x="600" y="175" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="#f97316" text-anchor="middle" dominant-baseline="middle">O</text>
  
  <!-- Title -->
  <text x="600" y="280" font-family="Arial, sans-serif" font-size="50" font-weight="800" fill="white" text-anchor="middle">OMA Digital</text>
  
  <!-- Subtitle -->
  <text x="600" y="350" font-family="Arial, sans-serif" font-size="28" fill="white" text-anchor="middle" opacity="0.9">
    Solutions IA pour PME Sénégalaises à Dakar
  </text>
  
  <!-- Tagline -->
  <text x="600" y="400" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.8">
    Automatisation • Sites Ultra-Rapides • IA Conversationnelle
  </text>
</svg>
`;

// Create SVG files
const ogHomepageSVG = createOGImageSVG();
const ogImageSVG = createOGImageSVG();

// Write SVG files (these can be converted to WebP manually or with tools)
fs.writeFileSync(path.join(imagesDir, 'og-homepage.svg'), ogHomepageSVG);
fs.writeFileSync(path.join(imagesDir, 'og-image.svg'), ogImageSVG);

console.log('✅ Created OG image templates:');
console.log('   - public/images/og-homepage.svg');
console.log('   - public/images/og-image.svg');
console.log('');
console.log('To convert to WebP format, use:');
console.log('npx @squoosh/cli --webp \'{"quality":85}\' public/images/og-homepage.svg');
console.log('npx @squoosh/cli --webp \'{"quality":85}\' public/images/og-image.svg');