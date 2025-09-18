/**
 * Blog Image Optimization Script
 * This script optimizes images used in the blog section for better performance
 */

const fs = require('fs');
const path = require('path');

// Image optimization recommendations
const imageOptimizationTargets = {
  'public/images/auto_all.webp': { targetSize: 80, quality: 80 },
  'public/images/auto_fwi.webp': { targetSize: 100, quality: 80 },
  'public/images/chatbot.webp': { targetSize: 120, quality: 80 },
  'public/images/marq_dig.webp': { targetSize: 130, quality: 80 },
  'public/images/anal.webp': { targetSize: 90, quality: 80 },
  'public/images/wbapp.webp': { targetSize: 95, quality: 80 }
};

console.log('Blog Image Optimization Recommendations');
console.log('=====================================');

Object.entries(imageOptimizationTargets).forEach(([imagePath, config]) => {
  const fullPath = path.join(__dirname, imagePath);
  
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const currentSize = (stats.size / 1024).toFixed(1); // in KB
    
    console.log(`\n${path.basename(imagePath)}:`);
    console.log(`  Current size: ${currentSize}KB`);
    console.log(`  Target size: ${config.targetSize}KB`);
    console.log(`  Recommended quality: ${config.quality}%`);
    
    if (parseFloat(currentSize) > config.targetSize) {
      console.log(`  ⚠️  Optimization needed: ${(parseFloat(currentSize) - config.targetSize).toFixed(1)}KB can be saved`);
    } else {
      console.log(`  ✅ Already optimized`);
    }
  } else {
    console.log(`\n${path.basename(imagePath)}:`);
    console.log(`  ❌ File not found`);
  }
});

console.log('\n\nOptimization Commands:');
console.log('=====================');
console.log('Install Squoosh CLI:');
console.log('npm install -g @squoosh/cli');
console.log('\nOptimize all blog images:');
console.log('npx @squoosh/cli --webp \'{"quality":80,"method":6}\' public/images/*.webp');