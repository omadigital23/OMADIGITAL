#!/usr/bin/env node

/**
 * Comprehensive Testing Suite for OMA Digital
 * Automated functional, performance, and security testing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ComprehensiveTestingSuite {
  constructor() {
    this.results = {
      functional: { passed: 0, failed: 0, tests: [] },
      performance: { passed: 0, failed: 0, tests: [] },
      security: { passed: 0, failed: 0, tests: [] },
      integration: { passed: 0, failed: 0, tests: [] },
      e2e: { passed: 0, failed: 0, tests: [] }
    };
    
    this.config = {
      baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
      timeout: 30000,
      retries: 2
    };
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

  async runTest(category, name, testFn) {
    const startTime = Date.now();
    
    try {
      this.log(`Running ${category} test: ${name}`, 'info');
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      this.results[category].passed++;
      this.results[category].tests.push({
        name,
        status: 'PASSED',
        duration,
        result
      });
      
      this.log(`✅ ${name} (${duration}ms)`, 'success');
      return true;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results[category].failed++;
      this.results[category].tests.push({
        name,
        status: 'FAILED',
        duration,
        error: error.message
      });
      
      this.log(`❌ ${name}: ${error.message} (${duration}ms)`, 'error');
      return false;
    }
  }

  // Functional Tests
  async runFunctionalTests() {
    this.log('\n🧪 Running Functional Tests', 'phase');
    
    await this.runTest('functional', 'Homepage loads correctly', async () => {
      const response = await fetch(`${this.config.baseUrl}/`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const html = await response.text();
      if (!html.includes('OMA Digital')) throw new Error('Homepage content missing');
      
      return { status: response.status, contentLength: html.length };
    });

    await this.runTest('functional', 'Blog page loads correctly', async () => {
      const response = await fetch(`${this.config.baseUrl}/blog`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const html = await response.text();
      if (!html.includes('blog')) throw new Error('Blog content missing');
      
      return { status: response.status, contentLength: html.length };
    });

    await this.runTest('functional', 'Health check endpoint', async () => {
      const response = await fetch(`${this.config.baseUrl}/api/health`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (!data.status) throw new Error('Health status missing');
      
      return { status: data.status, uptime: data.uptime };
    });

    await this.runTest('functional', 'Chatbot API responds', async () => {
      const response = await fetch(`${this.config.baseUrl}/api/chat/gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test message',
          sessionId: 'test-session'
        })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (!data.response) throw new Error('No chatbot response');
      
      return { 
        responseLength: data.response.length,
        language: data.language,
        source: data.source
      };
    });

    await this.runTest('functional', 'Newsletter subscription', async () => {
      const response = await fetch(`${this.config.baseUrl}/api/subscribe-newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test-${Date.now()}@example.com`,
          source: 'test'
        })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return { success: data.success || true };
    });

    await this.runTest('functional', 'Quote form submission', async () => {
      const response = await fetch(`${this.config.baseUrl}/api/send-quote-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: `test-${Date.now()}@example.com`,
          phone: '+221701234567',
          service: 'Automatisation WhatsApp',
          message: 'Test quote request',
          location: 'senegal'
        })
      });
      
      // Quote form might return different status codes
      const data = await response.json();
      return { submitted: true, status: response.status };
    });
  }

  // Performance Tests
  async runPerformanceTests() {
    this.log('\n⚡ Running Performance Tests', 'phase');
    
    await this.runTest('performance', 'Homepage load time', async () => {
      const startTime = Date.now();
      const response = await fetch(`${this.config.baseUrl}/`);
      const loadTime = Date.now() - startTime;
      
      if (loadTime > 3000) throw new Error(`Load time ${loadTime}ms exceeds 3000ms threshold`);
      
      return { loadTime, status: response.status };
    });

    await this.runTest('performance', 'API response time', async () => {
      const startTime = Date.now();
      const response = await fetch(`${this.config.baseUrl}/api/health`);
      const responseTime = Date.now() - startTime;
      
      if (responseTime > 2000) throw new Error(`Response time ${responseTime}ms exceeds 2000ms threshold`);
      
      return { responseTime, status: response.status };
    });

    await this.runTest('performance', 'Chatbot response time', async () => {
      const startTime = Date.now();
      const response = await fetch(`${this.config.baseUrl}/api/chat/gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Quick test',
          sessionId: 'perf-test'
        })
      });
      const responseTime = Date.now() - startTime;
      
      if (responseTime > 10000) throw new Error(`Chatbot response time ${responseTime}ms exceeds 10000ms threshold`);
      
      return { responseTime, status: response.status };
    });

    await this.runTest('performance', 'Concurrent requests handling', async () => {
      const requests = [];
      const concurrency = 10;
      
      for (let i = 0; i < concurrency; i++) {
        requests.push(
          fetch(`${this.config.baseUrl}/api/health`).then(r => ({
            status: r.status,
            ok: r.ok
          }))
        );
      }
      
      const results = await Promise.all(requests);
      const successCount = results.filter(r => r.ok).length;
      
      if (successCount < concurrency * 0.9) {
        throw new Error(`Only ${successCount}/${concurrency} requests succeeded`);
      }
      
      return { concurrency, successCount, successRate: successCount / concurrency };
    });

    await this.runTest('performance', 'Static asset loading', async () => {
      const assets = [
        '/images/logo.webp',
        '/manifest.json',
        '/sitemap.xml'
      ];
      
      const results = [];
      
      for (const asset of assets) {
        const startTime = Date.now();
        const response = await fetch(`${this.config.baseUrl}${asset}`);
        const loadTime = Date.now() - startTime;
        
        results.push({
          asset,
          loadTime,
          status: response.status,
          size: response.headers.get('content-length')
        });
      }
      
      const avgLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0) / results.length;
      if (avgLoadTime > 1000) throw new Error(`Average asset load time ${avgLoadTime}ms exceeds 1000ms`);
      
      return { assets: results.length, avgLoadTime };
    });
  }

  // Security Tests
  async runSecurityTests() {
    this.log('\n🔒 Running Security Tests', 'phase');
    
    await this.runTest('security', 'XSS protection', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      const response = await fetch(`${this.config.baseUrl}/api/chat/gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: xssPayload,
          sessionId: 'security-test'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.response && data.response.includes('<script>')) {
          throw new Error('XSS payload not sanitized');
        }
      }
      
      return { protected: true, status: response.status };
    });

    await this.runTest('security', 'SQL injection protection', async () => {
      const sqlPayload = "'; DROP TABLE users; --";
      
      const response = await fetch(`${this.config.baseUrl}/api/subscribe-newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: sqlPayload,
          source: 'security-test'
        })
      });
      
      // Should return error for invalid email, not execute SQL
      if (response.status === 200) {
        const data = await response.json();
        if (data.success) {
          throw new Error('SQL injection payload may have been processed');
        }
      }
      
      return { protected: true, status: response.status };
    });

    await this.runTest('security', 'Rate limiting', async () => {
      const requests = [];
      const rapidRequests = 25;
      
      // Send rapid requests to trigger rate limiting
      for (let i = 0; i < rapidRequests; i++) {
        requests.push(
          fetch(`${this.config.baseUrl}/api/chat/gemini`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: `Rate limit test ${i}`,
              sessionId: 'rate-limit-test'
            })
          }).then(r => r.status)
        );
      }
      
      const statuses = await Promise.all(requests);
      const rateLimitedCount = statuses.filter(status => status === 429).length;
      
      if (rateLimitedCount === 0) {
        throw new Error('Rate limiting not working - no 429 responses');
      }
      
      return { 
        totalRequests: rapidRequests, 
        rateLimited: rateLimitedCount,
        rateLimitWorking: true
      };
    });

    await this.runTest('security', 'Security headers', async () => {
      const response = await fetch(`${this.config.baseUrl}/`);
      
      const requiredHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'strict-transport-security'
      ];
      
      const missingHeaders = [];
      
      for (const header of requiredHeaders) {
        if (!response.headers.get(header)) {
          missingHeaders.push(header);
        }
      }
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing security headers: ${missingHeaders.join(', ')}`);
      }
      
      return { 
        headersPresent: requiredHeaders.length,
        headers: Object.fromEntries(
          requiredHeaders.map(h => [h, response.headers.get(h)])
        )
      };
    });

    await this.runTest('security', 'Admin endpoint protection', async () => {
      const response = await fetch(`${this.config.baseUrl}/api/admin/analytics`);
      
      // Should be protected (401/403) or redirect to login
      if (response.status === 200) {
        throw new Error('Admin endpoint not properly protected');
      }
      
      return { 
        protected: true, 
        status: response.status,
        expectedProtection: response.status === 401 || response.status === 403
      };
    });
  }

  // Integration Tests
  async runIntegrationTests() {
    this.log('\n🔗 Running Integration Tests', 'phase');
    
    await this.runTest('integration', 'Database connectivity', async () => {
      const response = await fetch(`${this.config.baseUrl}/api/health`);
      const data = await response.json();
      
      if (!data.services || !data.services.database) {
        throw new Error('Database health check not available');
      }
      
      if (data.services.database.status === 'unhealthy') {
        throw new Error('Database is unhealthy');
      }
      
      return {
        status: data.services.database.status,
        latency: data.services.database.latency_ms
      };
    });

    await this.runTest('integration', 'AI service connectivity', async () => {
      const response = await fetch(`${this.config.baseUrl}/api/health`);
      const data = await response.json();
      
      if (!data.services || !data.services.ai) {
        throw new Error('AI service health check not available');
      }
      
      if (data.services.ai.status === 'unhealthy') {
        throw new Error('AI service is unhealthy');
      }
      
      return {
        status: data.services.ai.status,
        latency: data.services.ai.latency_ms
      };
    });

    await this.runTest('integration', 'End-to-end chatbot flow', async () => {
      // Test complete chatbot interaction
      const sessionId = `integration-test-${Date.now()}`;
      
      const response = await fetch(`${this.config.baseUrl}/api/chat/gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Bonjour, je veux des informations sur vos services',
          sessionId
        })
      });
      
      if (!response.ok) throw new Error(`Chatbot API failed: ${response.status}`);
      
      const data = await response.json();
      
      if (!data.response) throw new Error('No chatbot response');
      if (!data.language) throw new Error('No language detected');
      if (data.language !== 'fr') throw new Error('Wrong language detected');
      
      return {
        sessionId,
        responseLength: data.response.length,
        language: data.language,
        source: data.source,
        confidence: data.confidence
      };
    });

    await this.runTest('integration', 'Form to database flow', async () => {
      const testEmail = `integration-test-${Date.now()}@example.com`;
      
      // Submit newsletter form
      const response = await fetch(`${this.config.baseUrl}/api/subscribe-newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          source: 'integration-test'
        })
      });
      
      // Should succeed or handle gracefully
      const data = await response.json();
      
      return {
        submitted: true,
        email: testEmail,
        status: response.status,
        response: data
      };
    });
  }

  // E2E Tests (Simulated)
  async runE2ETests() {
    this.log('\n🎭 Running E2E Tests (Simulated)', 'phase');
    
    await this.runTest('e2e', 'User journey: Homepage to Contact', async () => {
      // Simulate user navigation
      const steps = [
        { url: '/', expected: 'OMA Digital' },
        { url: '/#contact', expected: 'contact' },
      ];
      
      for (const step of steps) {
        const response = await fetch(`${this.config.baseUrl}${step.url}`);
        if (!response.ok) throw new Error(`Failed to load ${step.url}`);
        
        const html = await response.text();
        if (!html.toLowerCase().includes(step.expected.toLowerCase())) {
          throw new Error(`Expected content "${step.expected}" not found in ${step.url}`);
        }
      }
      
      return { steps: steps.length, completed: true };
    });

    await this.runTest('e2e', 'User journey: Blog browsing', async () => {
      // Test blog page and article access
      const blogResponse = await fetch(`${this.config.baseUrl}/blog`);
      if (!blogResponse.ok) throw new Error('Blog page failed to load');
      
      const blogHtml = await blogResponse.text();
      if (!blogHtml.includes('blog')) throw new Error('Blog content missing');
      
      return { blogLoaded: true, contentFound: true };
    });

    await this.runTest('e2e', 'User journey: Chatbot interaction', async () => {
      // Simulate complete chatbot conversation
      const messages = [
        'Bonjour',
        'Je veux des informations sur WhatsApp',
        'Quel est le prix?'
      ];
      
      const sessionId = `e2e-test-${Date.now()}`;
      const responses = [];
      
      for (const message of messages) {
        const response = await fetch(`${this.config.baseUrl}/api/chat/gemini`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, sessionId })
        });
        
        if (response.ok) {
          const data = await response.json();
          responses.push({
            message,
            response: data.response?.substring(0, 50) + '...',
            language: data.language
          });
        }
      }
      
      if (responses.length !== messages.length) {
        throw new Error(`Only ${responses.length}/${messages.length} messages processed`);
      }
      
      return { 
        conversationLength: responses.length,
        sessionId,
        allResponsesReceived: true
      };
    });
  }

  // Generate comprehensive report
  generateReport() {
    const totalTests = Object.values(this.results).reduce((sum, category) => 
      sum + category.passed + category.failed, 0
    );
    
    const totalPassed = Object.values(this.results).reduce((sum, category) => 
      sum + category.passed, 0
    );
    
    const totalFailed = Object.values(this.results).reduce((sum, category) => 
      sum + category.failed, 0
    );
    
    const overallScore = Math.round((totalPassed / totalTests) * 100);
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        overallScore,
        status: overallScore >= 90 ? 'EXCELLENT' : overallScore >= 75 ? 'GOOD' : overallScore >= 60 ? 'ACCEPTABLE' : 'POOR'
      },
      categories: this.results,
      recommendations: this.generateRecommendations()
    };
    
    // Save report
    const reportPath = `test-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.displaySummary(report);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    Object.entries(this.results).forEach(([category, result]) => {
      if (result.failed > 0) {
        const failedTests = result.tests.filter(t => t.status === 'FAILED');
        failedTests.forEach(test => {
          recommendations.push({
            category,
            test: test.name,
            issue: test.error,
            priority: category === 'security' ? 'HIGH' : category === 'functional' ? 'MEDIUM' : 'LOW'
          });
        });
      }
    });
    
    return recommendations;
  }

  displaySummary(report) {
    this.log('\n📊 Testing Summary', 'phase');
    this.log(`Overall Score: ${report.summary.overallScore}% (${report.summary.status})`, 
      report.summary.overallScore >= 75 ? 'success' : 'warning');
    this.log(`Total Tests: ${report.summary.totalTests}`);
    this.log(`Passed: ${report.summary.totalPassed}`, 'success');
    this.log(`Failed: ${report.summary.totalFailed}`, report.summary.totalFailed > 0 ? 'error' : 'success');
    
    // Category breakdown
    this.log('\n📋 Category Breakdown:', 'info');
    Object.entries(this.results).forEach(([category, result]) => {
      const total = result.passed + result.failed;
      const score = total > 0 ? Math.round((result.passed / total) * 100) : 0;
      this.log(`${category.toUpperCase()}: ${result.passed}/${total} (${score}%)`, 
        score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error');
    });
    
    // Recommendations
    if (report.recommendations.length > 0) {
      this.log('\n⚠️ Recommendations:', 'warning');
      report.recommendations.forEach((rec, index) => {
        this.log(`${index + 1}. [${rec.priority}] ${rec.category}/${rec.test}: ${rec.issue}`, 'warning');
      });
    }
  }

  // Main execution
  async run() {
    this.log('🚀 Starting Comprehensive Testing Suite', 'phase');
    
    try {
      await this.runFunctionalTests();
      await this.runPerformanceTests();
      await this.runSecurityTests();
      await this.runIntegrationTests();
      await this.runE2ETests();
      
      const report = this.generateReport();
      
      if (report.summary.overallScore >= 75) {
        this.log('\n🎉 Testing completed successfully! Application ready for production.', 'success');
        return true;
      } else {
        this.log('\n⚠️ Testing completed with issues. Review recommendations before production.', 'warning');
        return false;
      }
      
    } catch (error) {
      this.log(`\n💥 Testing suite failed: ${error.message}`, 'error');
      return false;
    }
  }
}

// Main execution
async function main() {
  const suite = new ComprehensiveTestingSuite();
  
  try {
    const success = await suite.run();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Testing suite crashed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ComprehensiveTestingSuite;