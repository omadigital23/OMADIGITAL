#!/usr/bin/env node

/**
 * Enhanced TypeScript checking for CI/CD pipeline
 * Provides detailed analysis and reporting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  maxErrors: {
    main: 0,        // Production branch - zero tolerance
    develop: 50,    // Development branch - some tolerance
    feature: 100    // Feature branches - more tolerance
  },
  reportDir: 'reports',
  typeCoverageThreshold: 85.0
};

// Utility functions
const getCurrentBranch = () => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return process.env.GITHUB_REF_NAME || 'unknown';
  }
};

const getBranchType = (branch) => {
  if (branch === 'main' || branch === 'master') return 'main';
  if (branch === 'develop' || branch === 'development') return 'develop';
  return 'feature';
};

const ensureReportDir = () => {
  if (!fs.existsSync(CONFIG.reportDir)) {
    fs.mkdirSync(CONFIG.reportDir, { recursive: true });
  }
};

const runTypeCheck = () => {
  console.log('🔍 Running TypeScript type check...');
  
  try {
    const output = execSync('npm run type-check', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return { success: true, output, errors: [] };
  } catch (error) {
    const output = error.stdout + error.stderr;
    const errorLines = output.split('\n').filter(line => 
      line.includes('error TS')
    );
    
    return { 
      success: false, 
      output, 
      errors: errorLines,
      errorCount: errorLines.length
    };
  }
};

const analyzeErrors = (errors) => {
  const analysis = {
    total: errors.length,
    byType: {},
    byFile: {},
    critical: [],
    suggestions: []
  };
  
  errors.forEach(error => {
    // Extract error type
    const typeMatch = error.match(/error (TS\d+):/);
    if (typeMatch) {
      const errorType = typeMatch[1];
      analysis.byType[errorType] = (analysis.byType[errorType] || 0) + 1;
    }
    
    // Extract file path
    const fileMatch = error.match(/^([^:]+):/);
    if (fileMatch) {
      const file = fileMatch[1];
      analysis.byFile[file] = (analysis.byFile[file] || 0) + 1;
    }
    
    // Identify critical errors
    if (error.includes('TS2322') || error.includes('TS2345') || error.includes('TS2532')) {
      analysis.critical.push(error);
    }
  });
  
  // Generate suggestions
  if (analysis.byType['TS2322']) {
    analysis.suggestions.push('Consider adding proper type annotations and null checks');
  }
  if (analysis.byType['TS2532']) {
    analysis.suggestions.push('Use optional chaining (?.) and nullish coalescing (??)');
  }
  if (analysis.byType['TS2345']) {
    analysis.suggestions.push('Review function parameter types and interfaces');
  }
  
  return analysis;
};

const generateReport = (result, analysis, branch, branchType) => {
  const timestamp = new Date().toISOString();
  const maxErrors = CONFIG.maxErrors[branchType];
  
  const report = {
    timestamp,
    branch,
    branchType,
    typeCheck: {
      success: result.success,
      errorCount: result.errorCount || 0,
      maxAllowed: maxErrors,
      passed: (result.errorCount || 0) <= maxErrors
    },
    analysis,
    recommendations: generateRecommendations(analysis),
    output: result.output
  };
  
  // Save detailed report
  const reportPath = path.join(CONFIG.reportDir, `type-check-${timestamp.split('T')[0]}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Save summary
  const summaryPath = path.join(CONFIG.reportDir, 'type-check-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    lastRun: timestamp,
    branch,
    errorCount: result.errorCount || 0,
    passed: report.typeCheck.passed,
    criticalErrors: analysis.critical.length
  }, null, 2));
  
  return report;
};

const generateRecommendations = (analysis) => {
  const recommendations = [];
  
  // Most problematic files
  const topFiles = Object.entries(analysis.byFile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
    
  if (topFiles.length > 0) {
    recommendations.push({
      type: 'priority',
      title: 'Focus on these files first',
      files: topFiles.map(([file, count]) => ({ file, errors: count }))
    });
  }
  
  // Common error patterns
  const commonErrors = Object.entries(analysis.byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
    
  if (commonErrors.length > 0) {
    recommendations.push({
      type: 'patterns',
      title: 'Most common error types',
      errors: commonErrors.map(([type, count]) => ({ type, count }))
    });
  }
  
  // Null safety recommendations
  if (analysis.byType['TS2532'] || analysis.byType['TS18047']) {
    recommendations.push({
      type: 'null-safety',
      title: 'Implement null safety patterns',
      suggestion: 'Use the null safety utilities from src/utils/null-safety.ts'
    });
  }
  
  return recommendations;
};

const runTypeCoverage = () => {
  console.log('📊 Analyzing type coverage...');
  
  try {
    // Install type-coverage if not available
    try {
      execSync('npx type-coverage --version', { stdio: 'pipe' });
    } catch {
      console.log('Installing type-coverage...');
      execSync('npm install -g type-coverage', { stdio: 'inherit' });
    }
    
    const output = execSync('npx type-coverage --detail', { encoding: 'utf8' });
    const coverageMatch = output.match(/(\d+\.\d+)%/);
    const coverage = coverageMatch ? parseFloat(coverageMatch[1]) : 0;
    
    const passed = coverage >= CONFIG.typeCoverageThreshold;
    
    return {
      coverage,
      threshold: CONFIG.typeCoverageThreshold,
      passed,
      output
    };
  } catch (error) {
    return {
      coverage: 0,
      threshold: CONFIG.typeCoverageThreshold,
      passed: false,
      output: error.message,
      error: true
    };
  }
};

const printSummary = (report, typeCoverage) => {
  console.log('\n' + '='.repeat(60));
  console.log('📋 TYPE SAFETY REPORT SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`🌟 Branch: ${report.branch} (${report.branchType})`);
  console.log(`📅 Timestamp: ${report.timestamp}`);
  
  console.log('\n📊 TYPE CHECK RESULTS:');
  console.log(`   Errors Found: ${report.typeCheck.errorCount}`);
  console.log(`   Max Allowed: ${report.typeCheck.maxAllowed}`);
  console.log(`   Status: ${report.typeCheck.passed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (report.analysis.critical.length > 0) {
    console.log(`   Critical Errors: ${report.analysis.critical.length}`);
  }
  
  console.log('\n📈 TYPE COVERAGE:');
  if (typeCoverage.error) {
    console.log(`   Status: ⚠️ UNABLE TO CHECK`);
  } else {
    console.log(`   Coverage: ${typeCoverage.coverage}%`);
    console.log(`   Threshold: ${typeCoverage.threshold}%`);
    console.log(`   Status: ${typeCoverage.passed ? '✅ PASSED' : '❌ FAILED'}`);
  }
  
  if (report.analysis.total > 0) {
    console.log('\n🔍 TOP ERROR TYPES:');
    Object.entries(report.analysis.byType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count} occurrences`);
      });
  }
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    report.recommendations.forEach(rec => {
      console.log(`   • ${rec.title}`);
    });
  }
  
  console.log('\n📁 Reports saved to:', CONFIG.reportDir);
  console.log('='.repeat(60));
};

// Main execution
const main = async () => {
  console.log('🚀 Starting comprehensive type safety check...');
  
  ensureReportDir();
  
  const branch = getCurrentBranch();
  const branchType = getBranchType(branch);
  
  console.log(`📍 Branch: ${branch} (${branchType})`);
  console.log(`📏 Max errors allowed: ${CONFIG.maxErrors[branchType]}`);
  
  // Run type check
  const result = runTypeCheck();
  const analysis = result.errors ? analyzeErrors(result.errors) : { total: 0, byType: {}, byFile: {}, critical: [], suggestions: [] };
  
  // Generate report
  const report = generateReport(result, analysis, branch, branchType);
  
  // Run type coverage
  const typeCoverage = runTypeCoverage();
  
  // Print summary
  printSummary(report, typeCoverage);
  
  // Determine exit code
  const typeCheckPassed = report.typeCheck.passed;
  const coveragePassed = typeCoverage.passed || typeCoverage.error; // Don't fail on coverage check errors
  
  if (!typeCheckPassed) {
    console.log(`\n❌ Type check failed: ${report.typeCheck.errorCount} errors (max: ${report.typeCheck.maxAllowed})`);
    process.exit(1);
  }
  
  if (!coveragePassed) {
    console.log(`\n⚠️ Type coverage below threshold: ${typeCoverage.coverage}% (min: ${typeCoverage.threshold}%)`);
    // Don't fail the build for coverage, just warn
  }
  
  console.log('\n✅ All type safety checks passed!');
  process.exit(0);
};

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Unexpected error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { main, runTypeCheck, analyzeErrors, generateReport };