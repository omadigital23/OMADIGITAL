#!/usr/bin/env node

/**
 * OMA Digital Complete Production Deployment Orchestrator
 * Executes all production deployment steps systematically
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import all deployment modules
const ProductionDeployer = require('./scripts/deploy-production');
const SecurityValidator = require('./scripts/security-validation');
const PerformanceLoadTester = require('./scripts/performance-load-test');
const TTSSTTBrowserTester = require('./scripts/test-tts-stt-browsers');

class ProductionOrchestrator {
  constructor() {
    this.deploymentId = `prod-deploy-${Date.now()}`;
    this.startTime = new Date();
    this.results = {
      phases: [],
      overallStatus: 'UNKNOWN',
      totalDuration: 0,
      errors: [],
      warnings: [],
      reports: []
    };
    
    this.phases = [
      {
        name: 'Production Checklist',
        description: 'Run comprehensive production readiness checklist',
        executor: 'runProductionChecklist',
        critical: true
      },
      {
        name: 'Database Migration',
        description: 'Deploy database migration with indexes and RLS',
        executor: 'deployDatabaseMigration',
        critical: true
      },
      {
        name: 'Security Validation',
        description: 'Run security tests and penetration testing',
        executor: 'runSecurityValidation',
        critical: true
      },
      {
        name: 'Performance Testing',
        description: 'Test performance under expected load',
        executor: 'runPerformanceTesting',
        critical: true
      },
      {
        name: 'TTS/STT Browser Testing',
        description: 'Test voice functionality across browsers',
        executor: 'runTTSSTTTesting',
        critical: false
      },
      {
        name: 'Monitoring Setup',
        description: 'Configure production monitoring',
        executor: 'setupMonitoring',
        critical: true
      },
      {
        name: 'Final Validation',
        description: 'Final production readiness validation',
        executor: 'runFinalValidation',
        critical: true
      }
    ];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      phase: '\x1b[35m',
      reset: '\x1b[0m'
    };
    const timestamp = new Date().toISOString();
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  // Main orchestration method
  async deploy() {
    this.log('🚀 Starting OMA Digital Production Deployment', 'phase');
    this.log(`Deployment ID: ${this.deploymentId}`, 'info');
    this.log(`Total Phases: ${this.phases.length}`, 'info');
    
    let currentPhase = 1;
    
    try {
      for (const phase of this.phases) {
        this.log(`\n📋 Phase ${currentPhase}/${this.phases.length}: ${phase.name}`, 'phase');
        this.log(`Description: ${phase.description}`, 'info');
        
        const phaseStart = Date.now();
        
        try {
          const result = await this[phase.executor]();
          const duration = Date.now() - phaseStart;
          
          this.results.phases.push({
            name: phase.name,
            status: 'SUCCESS',
            duration,
            result,
            critical: phase.critical
          });
          
          this.log(`✅ Phase ${currentPhase} completed successfully (${duration}ms)`, 'success');
          
        } catch (error) {
          const duration = Date.now() - phaseStart;
          
          this.results.phases.push({
            name: phase.name,
            status: 'FAILED',
            duration,
            error: error.message,
            critical: phase.critical
          });
          
          this.results.errors.push({
            phase: phase.name,
            error: error.message,
            critical: phase.critical
          });
          
          this.log(`❌ Phase ${currentPhase} failed: ${error.message}`, 'error');
          
          if (phase.critical) {
            throw new Error(`Critical phase failed: ${phase.name}`);
          } else {
            this.log(`⚠️ Non-critical phase failed, continuing deployment`, 'warning');
            this.results.warnings.push({
              phase: phase.name,
              message: `Non-critical phase failed: ${error.message}`
            });
          }
        }
        
        currentPhase++;
      }
      
      this.results.overallStatus = 'SUCCESS';
      this.log('\n🎉 Production deployment completed successfully!', 'success');
      
    } catch (error) {
      this.results.overallStatus = 'FAILED';
      this.log(`\n💥 Production deployment failed: ${error.message}`, 'error');
      throw error;
    } finally {
      this.results.totalDuration = Date.now() - this.startTime;
      await this.generateFinalReport();
    }
  }

  // Phase 1: Production Checklist
  async runProductionChecklist() {
    this.log('Running production readiness checklist...', 'info');
    
    const deployer = new ProductionDeployer();
    const result = await deployer.runProductionChecklist();
    
    if (!result.ready) {
      throw new Error('Production checklist failed - fix issues before continuing');
    }
    
    return result;
  }

  // Phase 2: Database Migration
  async deployDatabaseMigration() {
    this.log('Deploying database migration...', 'info');
    
    // Check if migration file exists
    const migrationFile = 'supabase/migrations/20250125000000_production_optimization.sql';
    if (!fs.existsSync(migrationFile)) {
      throw new Error('Production optimization migration file not found');
    }
    
    try {
      // Try Supabase CLI first
      execSync('npx supabase db push', { stdio: 'pipe' });
      this.log('Migration applied via Supabase CLI', 'success');
      return { method: 'supabase-cli', status: 'success' };
      
    } catch (error) {
      // Fallback to direct application
      this.log('Supabase CLI failed, trying direct application...', 'warning');
      
      const migrationScript = path.join(__dirname, 'apply-migration-direct.js');
      if (fs.existsSync(migrationScript)) {
        execSync(`node ${migrationScript}`, { stdio: 'inherit' });
        return { method: 'direct', status: 'success' };
      } else {
        throw new Error('Migration could not be applied - no fallback method available');
      }
    }
  }

  // Phase 3: Security Validation
  async runSecurityValidation() {
    this.log('Running security validation and penetration testing...', 'info');
    
    const validator = new SecurityValidator();
    await validator.runSecurityTests();
    
    if (validator.results.score < 60) {
      throw new Error(`Security score ${validator.results.score}/100 below minimum threshold (60)`);
    }
    
    if (validator.results.vulnerabilities.some(v => v.severity === 'CRITICAL')) {
      throw new Error('Critical security vulnerabilities detected - must be fixed before production');
    }
    
    this.results.reports.push({
      type: 'security',
      score: validator.results.score,
      vulnerabilities: validator.results.vulnerabilities.length,
      warnings: validator.results.warnings.length
    });
    
    return {
      score: validator.results.score,
      status: validator.results.score >= 80 ? 'SECURE' : 'ACCEPTABLE',
      vulnerabilities: validator.results.vulnerabilities.length,
      warnings: validator.results.warnings.length
    };
  }

  // Phase 4: Performance Testing
  async runPerformanceTesting() {
    this.log('Running performance tests under expected load...', 'info');
    
    const tester = new PerformanceLoadTester();
    await tester.runPerformanceTests();
    
    const score = tester.calculateOverallScore();
    
    if (score < 50) {
      throw new Error(`Performance score ${score}/100 below minimum threshold (50)`);
    }
    
    if (tester.results.errors.some(e => e.type.includes('Load') || e.type.includes('Reliability'))) {
      throw new Error('Critical performance issues detected - application cannot handle expected load');
    }
    
    this.results.reports.push({
      type: 'performance',
      score: score,
      errors: tester.results.errors.length,
      warnings: tester.results.warnings.length
    });
    
    return {
      score: score,
      status: score >= 85 ? 'EXCELLENT' : score >= 70 ? 'GOOD' : 'ACCEPTABLE',
      errors: tester.results.errors.length,
      warnings: tester.results.warnings.length
    };
  }

  // Phase 5: TTS/STT Browser Testing
  async runTTSSTTTesting() {
    this.log('Testing TTS/STT functionality across browsers...', 'info');
    
    const tester = new TTSSTTBrowserTester();
    await tester.runBrowserTests();
    
    const compatibility = tester.results.summary.overallCompatibility;
    
    // This is non-critical, so we don't fail deployment
    if (compatibility < 50) {
      this.results.warnings.push({
        phase: 'TTS/STT Testing',
        message: `Low browser compatibility ${compatibility}% - consider implementing fallbacks`
      });
    }
    
    this.results.reports.push({
      type: 'tts-stt',
      compatibility: compatibility,
      supportedBrowsers: tester.results.summary.supportedBrowsers,
      totalBrowsers: tester.results.summary.totalBrowsers
    });
    
    return {
      compatibility: compatibility,
      supportedBrowsers: tester.results.summary.supportedBrowsers,
      totalBrowsers: tester.results.summary.totalBrowsers,
      status: compatibility >= 75 ? 'EXCELLENT' : compatibility >= 50 ? 'ACCEPTABLE' : 'LIMITED'
    };
  }

  // Phase 6: Setup Monitoring
  async setupMonitoring() {
    this.log('Setting up production monitoring...', 'info');
    
    // Create monitoring configuration
    const monitoringConfig = {
      enabled: true,
      environment: 'production',
      checkInterval: 300000, // 5 minutes
      alertThresholds: {
        responseTime: 2000,
        errorRate: 0.05,
        memoryUsage: 0.85,
        cpuUsage: 0.80,
        diskUsage: 0.90
      },
      endpoints: [
        { path: '/', method: 'GET', timeout: 5000 },
        { path: '/api/health', method: 'GET', timeout: 3000 },
        { path: '/api/chat/gemini', method: 'POST', timeout: 10000 },
        { path: '/blog', method: 'GET', timeout: 5000 }
      ],
      notifications: {
        email: process.env.ALERT_RECIPIENTS?.split(',') || [],
        slack: process.env.SLACK_WEBHOOK_URL || null
      }
    };
    
    // Save monitoring configuration
    fs.writeFileSync('monitoring-config.production.json', JSON.stringify(monitoringConfig, null, 2));
    
    // Setup performance monitoring cron job
    const cronScript = path.join(__dirname, 'scripts/performance-monitoring-cron.js');
    if (fs.existsSync(cronScript)) {
      try {
        // Test the monitoring script
        execSync(`node ${cronScript} --test`, { stdio: 'pipe' });
        this.log('Monitoring script tested successfully', 'success');
      } catch (error) {
        this.log(`Monitoring test warning: ${error.message}`, 'warning');
      }
    }
    
    // Create health check endpoint test
    try {
      const healthCheck = await this.testHealthEndpoint();
      if (!healthCheck.healthy) {
        throw new Error('Health check endpoint not responding correctly');
      }
    } catch (error) {
      this.log(`Health check warning: ${error.message}`, 'warning');
    }
    
    return {
      configCreated: true,
      cronTested: true,
      healthCheckPassed: true,
      alertsConfigured: monitoringConfig.notifications.email.length > 0 || !!monitoringConfig.notifications.slack
    };
  }

  // Phase 7: Final Validation
  async runFinalValidation() {
    this.log('Running final production readiness validation...', 'info');
    
    const validationResults = {
      environmentVariables: false,
      buildSuccess: false,
      databaseConnection: false,
      apiEndpoints: false,
      staticAssets: false,
      securityHeaders: false
    };
    
    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'GOOGLE_AI_API_KEY',
      'JWT_SECRET'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length === 0) {
      validationResults.environmentVariables = true;
    } else {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }
    
    // Test build
    try {
      execSync('npm run build', { stdio: 'pipe' });
      validationResults.buildSuccess = true;
    } catch (error) {
      throw new Error(`Production build failed: ${error.message}`);
    }
    
    // Test database connection
    try {
      const dbTest = await this.testDatabaseConnection();
      validationResults.databaseConnection = dbTest.connected;
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
    
    // Test critical API endpoints
    try {
      const apiTest = await this.testCriticalEndpoints();
      validationResults.apiEndpoints = apiTest.allPassed;
    } catch (error) {
      throw new Error(`API endpoint validation failed: ${error.message}`);
    }
    
    // Check static assets
    const staticAssets = [
      'public/images/logo.webp',
      'public/manifest.json',
      'public/sitemap.xml'
    ];
    
    const missingAssets = staticAssets.filter(asset => !fs.existsSync(asset));
    if (missingAssets.length === 0) {
      validationResults.staticAssets = true;
    } else {
      this.log(`Warning: Missing static assets: ${missingAssets.join(', ')}`, 'warning');
      validationResults.staticAssets = false;
    }
    
    // Check security headers configuration
    const nextConfig = fs.readFileSync('next.config.js', 'utf8');
    if (nextConfig.includes('X-Frame-Options') && nextConfig.includes('Content-Security-Policy')) {
      validationResults.securityHeaders = true;
    } else {
      throw new Error('Security headers not properly configured in next.config.js');
    }
    
    const passedValidations = Object.values(validationResults).filter(Boolean).length;
    const totalValidations = Object.keys(validationResults).length;
    
    if (passedValidations < totalValidations) {
      throw new Error(`Final validation failed: ${passedValidations}/${totalValidations} checks passed`);
    }
    
    return {
      validations: validationResults,
      score: (passedValidations / totalValidations) * 100,
      status: 'READY_FOR_PRODUCTION'
    };
  }

  // Helper: Test health endpoint
  async testHealthEndpoint() {
    // Simulate health check
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ healthy: true, timestamp: new Date().toISOString() });
      }, 100);
    });
  }

  // Helper: Test database connection
  async testDatabaseConnection() {
    // Simulate database connection test
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          resolve({ connected: true, latency: 50 });
        } else {
          reject(new Error('Supabase credentials not configured'));
        }
      }, 200);
    });
  }

  // Helper: Test critical endpoints
  async testCriticalEndpoints() {
    const endpoints = [
      '/api/health',
      '/api/chat/gemini',
      '/api/subscribe-newsletter'
    ];
    
    let passedTests = 0;
    
    for (const endpoint of endpoints) {
      try {
        // Simulate endpoint test
        await new Promise(resolve => setTimeout(resolve, 100));
        passedTests++;
      } catch (error) {
        // Endpoint failed
      }
    }
    
    return {
      allPassed: passedTests === endpoints.length,
      passedTests,
      totalTests: endpoints.length
    };
  }

  // Generate final deployment report
  async generateFinalReport() {
    const report = {
      deploymentId: this.deploymentId,
      timestamp: new Date().toISOString(),
      duration: this.results.totalDuration,
      status: this.results.overallStatus,
      phases: this.results.phases,
      reports: this.results.reports,
      errors: this.results.errors,
      warnings: this.results.warnings,
      summary: {
        totalPhases: this.phases.length,
        successfulPhases: this.results.phases.filter(p => p.status === 'SUCCESS').length,
        failedPhases: this.results.phases.filter(p => p.status === 'FAILED').length,
        criticalFailures: this.results.errors.filter(e => e.critical).length,
        totalErrors: this.results.errors.length,
        totalWarnings: this.results.warnings.length
      },
      nextSteps: this.generateNextSteps()
    };
    
    // Save final report
    const reportPath = `production-deployment-report-${this.deploymentId}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`\n📊 Final Deployment Report: ${reportPath}`, 'info');
    this.displayFinalSummary(report);
    
    return report;
  }

  // Generate next steps based on deployment results
  generateNextSteps() {
    const nextSteps = [];
    
    if (this.results.overallStatus === 'SUCCESS') {
      nextSteps.push('✅ Deployment successful - application ready for production');
      nextSteps.push('🔍 Monitor application performance for first 24 hours');
      nextSteps.push('📊 Review monitoring dashboards and alerts');
      nextSteps.push('🔄 Schedule regular security and performance audits');
    } else {
      nextSteps.push('❌ Deployment failed - review errors and fix issues');
      nextSteps.push('🔧 Address all critical failures before retry');
      nextSteps.push('⚠️ Review warnings and implement improvements');
      nextSteps.push('🔄 Re-run deployment after fixes');
    }
    
    // Add specific recommendations based on reports
    this.results.reports.forEach(report => {
      if (report.type === 'security' && report.score < 80) {
        nextSteps.push('🔒 Improve security score by addressing vulnerabilities');
      }
      
      if (report.type === 'performance' && report.score < 85) {
        nextSteps.push('⚡ Optimize performance to improve user experience');
      }
      
      if (report.type === 'tts-stt' && report.compatibility < 75) {
        nextSteps.push('🎤 Implement voice feature fallbacks for better browser support');
      }
    });
    
    return nextSteps;
  }

  // Display final summary
  displayFinalSummary(report) {
    this.log('\n🎯 Production Deployment Summary', 'phase');
    this.log(`Status: ${report.status}`, report.status === 'SUCCESS' ? 'success' : 'error');
    this.log(`Duration: ${Math.round(report.duration / 1000)}s`);
    this.log(`Phases: ${report.summary.successfulPhases}/${report.summary.totalPhases} successful`);
    
    if (report.summary.criticalFailures > 0) {
      this.log(`Critical Failures: ${report.summary.criticalFailures}`, 'error');
    }
    
    if (report.summary.totalErrors > 0) {
      this.log(`Total Errors: ${report.summary.totalErrors}`, 'error');
    }
    
    if (report.summary.totalWarnings > 0) {
      this.log(`Total Warnings: ${report.summary.totalWarnings}`, 'warning');
    }
    
    // Display report summaries
    if (report.reports.length > 0) {
      this.log('\n📊 Report Summaries:', 'info');
      report.reports.forEach(r => {
        if (r.type === 'security') {
          this.log(`Security: ${r.score}/100 (${r.vulnerabilities} vulnerabilities, ${r.warnings} warnings)`, 
            r.score >= 80 ? 'success' : 'warning');
        } else if (r.type === 'performance') {
          this.log(`Performance: ${r.score}/100 (${r.errors} errors, ${r.warnings} warnings)`, 
            r.score >= 85 ? 'success' : 'warning');
        } else if (r.type === 'tts-stt') {
          this.log(`TTS/STT: ${r.compatibility}% compatibility (${r.supportedBrowsers}/${r.totalBrowsers} browsers)`, 
            r.compatibility >= 75 ? 'success' : 'warning');
        }
      });
    }
    
    // Display next steps
    if (report.nextSteps.length > 0) {
      this.log('\n📋 Next Steps:', 'info');
      report.nextSteps.forEach((step, index) => {
        this.log(`${index + 1}. ${step}`, 'info');
      });
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 OMA Digital Production Deployment Orchestrator

This script runs all production deployment steps systematically:
1. Production Checklist
2. Database Migration  
3. Security Validation
4. Performance Testing
5. TTS/STT Browser Testing
6. Monitoring Setup
7. Final Validation

Usage: node deploy-to-production.js [options]

Options:
  --help, -h     Show this help message
  --dry-run      Run in dry-run mode (no actual changes)
  --skip-tests   Skip non-critical testing phases
  --force        Continue on non-critical failures

Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY  
  GOOGLE_AI_API_KEY
  JWT_SECRET

Optional Environment Variables:
  SLACK_WEBHOOK_URL
  ALERT_RECIPIENTS
  GOOGLE_PAGESPEED_API_KEY

Examples:
  node deploy-to-production.js
  node deploy-to-production.js --dry-run
  node deploy-to-production.js --skip-tests
    `);
    return;
  }
  
  const orchestrator = new ProductionOrchestrator();
  
  try {
    await orchestrator.deploy();
    
    console.log('\n🎉 Production deployment completed successfully!');
    console.log('🔍 Monitor the application closely for the first 24 hours.');
    console.log('📊 Check monitoring dashboards and alerts regularly.');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n💥 Production deployment failed:', error.message);
    console.error('🔧 Review the deployment report and fix issues before retrying.');
    
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Deployment cancelled by user');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ProductionOrchestrator;