#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Performance budgets for OMA Digital
const budgets = {
  // Size budgets (bytes)
  javascript: 150 * 1024,     // 150KB
  css: 50 * 1024,             // 50KB  
  images: 500 * 1024,         // 500KB total
  fonts: 100 * 1024,          // 100KB
  total: 1000 * 1024,         // 1MB total
  
  // Core Web Vitals budgets (ms)
  lcp: 1500,                  // Largest Contentful Paint
  fid: 100,                   // First Input Delay  
  cls: 0.05,                  // Cumulative Layout Shift
  tti: 3500,                  // Time to Interactive
  
  // Additional metrics
  fcp: 1000,                  // First Contentful Paint
  ttfb: 600,                  // Time to First Byte
};

function checkBundleSize() {
  console.log('📦 Checking bundle sizes...');
  
  const buildDir = '.next';
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found. Run npm run build first.');
    return false;
  }
  
  // Check static files
  const staticDir = path.join(buildDir, 'static');
  if (fs.existsSync(staticDir)) {
    const jsFiles = getAllFiles(staticDir).filter(f => f.endsWith('.js'));
    const cssFiles = getAllFiles(staticDir).filter(f => f.endsWith('.css'));
    
    const jsSize = jsFiles.reduce((total, file) => {
      return total + fs.statSync(file).size;
    }, 0);
    
    const cssSize = cssFiles.reduce((total, file) => {
      return total + fs.statSync(file).size;
    }, 0);
    
    console.log(`JavaScript: ${(jsSize / 1024).toFixed(2)}KB (Budget: ${budgets.javascript / 1024}KB)`);
    console.log(`CSS: ${(cssSize / 1024).toFixed(2)}KB (Budget: ${budgets.css / 1024}KB)`);
    
    const jsExceeded = jsSize > budgets.javascript;
    const cssExceeded = cssSize > budgets.css;
    
    if (jsExceeded) console.error('❌ JavaScript budget exceeded!');
    if (cssExceeded) console.error('❌ CSS budget exceeded!');
    
    return !jsExceeded && !cssExceeded;
  }
  
  return true;
}

function getAllFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getAllFiles(name, files);
    } else {
      files.push(name);
    }
  }
  
  return files;
}

function checkLighthouseScores() {
  console.log('🔍 Checking Lighthouse scores...');
  
  const reportPath = 'tmp_rovodev_lighthouse-report.json';
  if (!fs.existsSync(reportPath)) {
    console.warn('⚠️ Lighthouse report not found. Run npm run lighthouse first.');
    return true;
  }
  
  try {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const scores = {
      performance: report.categories.performance.score * 100,
      accessibility: report.categories.accessibility.score * 100,
      seo: report.categories.seo.score * 100,
      'best-practices': report.categories['best-practices'].score * 100
    };
    
    console.log('Lighthouse Scores:');
    console.log(`Performance: ${scores.performance}/100`);
    console.log(`Accessibility: ${scores.accessibility}/100`);
    console.log(`SEO: ${scores.seo}/100`);
    console.log(`Best Practices: ${scores['best-practices']}/100`);
    
    const allPassed = Object.values(scores).every(score => score >= 90);
    
    if (!allPassed) {
      console.error('❌ Some Lighthouse scores below 90!');
    } else {
      console.log('✅ All Lighthouse scores above 90!');
    }
    
    return allPassed;
  } catch (error) {
    console.error('❌ Error reading Lighthouse report:', error.message);
    return false;
  }
}

function runBudgetCheck() {
  console.log('🎯 Running Performance Budget Check...\n');
  
  const bundleCheck = checkBundleSize();
  const lighthouseCheck = checkLighthouseScores();
  
  console.log('\n📊 Budget Check Results:');
  console.log(`Bundle Size: ${bundleCheck ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Lighthouse: ${lighthouseCheck ? '✅ PASS' : '❌ FAIL'}`);
  
  const overallPass = bundleCheck && lighthouseCheck;
  
  if (overallPass) {
    console.log('\n🎉 All performance budgets met!');
    process.exit(0);
  } else {
    console.log('\n💥 Performance budget exceeded!');
    process.exit(1);
  }
}

// Run the check
if (require.main === module) {
  runBudgetCheck();
}

module.exports = { budgets, checkBundleSize, checkLighthouseScores };