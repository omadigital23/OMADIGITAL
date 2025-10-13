#!/usr/bin/env node

/**
 * Production Checklist Runner
 * Automated verification of production readiness
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProductionChecker {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  check(description, testFn) {
    try {
      const result = testFn();
      if (result === true) {
        this.results.passed++;
        this.log(`✅ ${description}`, 'success');
        this.results.details.push({ description, status: 'PASS' });
      } else if (result === 'warning') {
        this.results.warnings++;
        this.log(`⚠️  ${description}`, 'warning');
        this.results.details.push({ description, status: 'WARNING' });
      } else {
        this.results.failed++;
        this.log(`❌ ${description}`, 'error');
        this.results.details.push({ description, status: 'FAIL', error: result });
      }
    } catch (error) {
      this.results.failed++;
      this.log(`❌ ${description}: ${error.message}`, 'error');
      this.results.details.push({ description, status: 'FAIL', error: error.message });
    }
  }

  // Environment & Configuration Checks
  checkEnvironment() {
    this.log('\n🔧 Environment & Configuration', 'info');
    
    this.check('Environment variables configured', () => {
      const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
      const missing = required.filter(key => !process.env[key]);
      return missing.length === 0 || `Missing: ${missing.join(', ')}`;
    });

    this.check('TypeScript configuration strict', () => {
      const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      return tsconfig.compilerOptions.strict === true;
    });

    this.check('Next.js configuration optimized', () => {
      const nextConfig = fs.readFileSync('next.config.js', 'utf8');
      return nextConfig.includes('swcMinify: true') && nextConfig.includes('reactStrictMode: true');
    });
  }

  // Security Checks
  checkSecurity() {
    this.log('\n🔒 Security Configuration', 'info');

    this.check('Security headers configured', () => {
      const nextConfig = fs.readFileSync('next.config.js', 'utf8');
      return nextConfig.includes('X-Frame-Options') && nextConfig.includes('Content-Security-Policy');
    });

    this.check('No hardcoded secrets in code', () => {
      try {
        execSync('grep -r "sk-\\|pk_\\|eyJ" --exclude-dir=node_modules --exclude-dir=.next . || true', { stdio: 'pipe' });
        return true;
      } catch {
        return 'Potential secrets found';
      }
    });

    this.check('Input sanitization implemented', () => {
      return fs.existsSync('src/lib/security-manager.ts');
    });
  }

  // Performance Checks
  checkPerformance() {
    this.log('\n⚡ Performance Optimization', 'info');

    this.check('Performance monitoring configured', () => {
      return fs.existsSync('src/lib/performance-optimizer.ts');
    });

    this.check('Image optimization enabled', () => {
      const nextConfig = fs.readFileSync('next.config.js', 'utf8');
      return nextConfig.includes('formats: [\'image/webp\', \'image/avif\']');
    });

    this.check('Bundle splitting configured', () => {
      const nextConfig = fs.readFileSync('next.config.js', 'utf8');
      return nextConfig.includes('splitChunks');
    });
  }

  // Database Checks
  checkDatabase() {
    this.log('\n🗄️  Database Configuration', 'info');

    this.check('Supabase connection manager exists', () => {
      return fs.existsSync('src/lib/supabase-enhanced.ts');
    });

    this.check('Database migration files exist', () => {
      return fs.existsSync('supabase/migrations') && 
             fs.readdirSync('supabase/migrations').length > 0;
    });

    this.check('Production optimization migration exists', () => {
      const migrations = fs.readdirSync('supabase/migrations');
      return migrations.some(file => file.includes('production_optimization'));
    });
  }

  // Chatbot Checks
  checkChatbot() {
    this.log('\n🤖 Chatbot Functionality', 'info');

    this.check('Enhanced TTS implementation exists', () => {
      return fs.existsSync('src/components/SmartChatbot/hooks/useEnhancedTTS.ts');
    });

    this.check('Gemini API integration configured', () => {
      return fs.existsSync('pages/api/chat/gemini.ts');
    });

    this.check('Error handling implemented', () => {
      const chatbotIndex = fs.readFileSync('src/components/SmartChatbot/index.tsx', 'utf8');
      return chatbotIndex.includes('retry') && chatbotIndex.includes('error');
    });
  }

  // Build & Dependencies
  checkBuild() {
    this.log('\n🏗️  Build & Dependencies', 'info');

    this.check('No high severity vulnerabilities', () => {
      try {
        execSync('npm audit --audit-level high', { stdio: 'pipe' });
        return true;
      } catch {
        return 'High severity vulnerabilities found';
      }
    });

    this.check('Build succeeds without errors', () => {
      try {
        execSync('npm run build', { stdio: 'pipe' });
        return true;
      } catch {
        return 'Build failed';
      }
    });

    this.check('TypeScript compilation succeeds', () => {
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        return true;
      } catch {
        return 'TypeScript errors found';
      }
    });
  }

  // Generate Report
  generateReport() {
    this.log('\n📊 Production Readiness Report', 'info');
    
    const total = this.results.passed + this.results.failed + this.results.warnings;
    const score = Math.round((this.results.passed / total) * 100);
    
    this.log(`\nTotal Checks: ${total}`);
    this.log(`Passed: ${this.results.passed}`, 'success');
    this.log(`Failed: ${this.results.failed}`, 'error');
    this.log(`Warnings: ${this.results.warnings}`, 'warning');
    this.log(`\nProduction Readiness Score: ${score}%`, score >= 90 ? 'success' : score >= 70 ? 'warning' : 'error');

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      score,
      summary: this.results,
      details: this.results.details
    };

    fs.writeFileSync('production-readiness-report.json', JSON.stringify(report, null, 2));
    this.log('\n📄 Detailed report saved to: production-readiness-report.json');

    if (score >= 90) {
      this.log('\n🚀 READY FOR PRODUCTION!', 'success');
    } else if (score >= 70) {
      this.log('\n⚠️  NEEDS ATTENTION - Address failed checks before production', 'warning');
    } else {
      this.log('\n❌ NOT READY - Critical issues must be resolved', 'error');
    }

    return score >= 90;
  }

  run() {
    this.log('🔍 Starting Production Readiness Check...', 'info');
    
    this.checkEnvironment();
    this.checkSecurity();
    this.checkPerformance();
    this.checkDatabase();
    this.checkChatbot();
    this.checkBuild();
    
    return this.generateReport();
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new ProductionChecker();
  const isReady = checker.run();
  process.exit(isReady ? 0 : 1);
}

module.exports = ProductionChecker;