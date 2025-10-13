#!/usr/bin/env node

// Performance monitoring automation script
// Run this script via cron job every 15 minutes for continuous monitoring
// Cron example: */15 * * * * node /path/to/scripts/performance-monitoring-cron.js

const fetch = require('cross-fetch');

const MONITORING_CONFIG = {
  baseUrl: process.env['NEXT_PUBLIC_SITE_URL'] || 'https://oma-digital.sn',
  adminApiUrl: process.env.ADMIN_API_URL || 'https://oma-digital.sn/api/admin',
  urls: [
    'https://oma-digital.sn',
    'https://oma-digital.sn/blog',
    'https://oma-digital.sn/admin'
  ],
  googlePageSpeedApiKey: process.env['GOOGLE_PAGESPEED_API_KEY'],
  checkIntervalMinutes: 15,
  alertCooldownMinutes: 60,
};

class PerformanceMonitoringCron {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.lastAlertTime = new Map(); // Track alert cooldowns
  }

  async run() {
    if (this.isRunning) {
      console.log('⏳ Monitoring already running, skipping...');
      return;
    }

    this.isRunning = true;
    this.lastRun = new Date();

    console.log(`🚀 Starting performance monitoring at ${this.lastRun.toISOString()}`);

    try {
      // Run monitoring for each configured URL
      for (const url of MONITORING_CONFIG.urls) {
        await this.monitorUrl(url);
        
        // Wait 10 seconds between URL checks to avoid rate limiting
        await this.sleep(10000);
      }

      // Check performance budgets
      await this.checkBudgets();

      // Clean up old data (run once daily)
      if (this.shouldRunDailyCleanup()) {
        await this.cleanupOldData();
      }

      console.log('✅ Performance monitoring completed successfully');

    } catch (error) {
      console.error('❌ Performance monitoring failed:', error);
      
      // Send alert about monitoring failure
      await this.sendMonitoringAlert({
        type: 'critical',
        message: `Performance monitoring script failed: ${error.message}`,
        timestamp: new Date()
      });
    } finally {
      this.isRunning = false;
    }
  }

  async monitorUrl(url) {
    console.log(`📊 Analyzing ${url}...`);

    try {
      // Run both mobile and desktop analysis
      const mobileAnalysis = await this.runPageSpeedAnalysis(url, 'mobile');
      const desktopAnalysis = await this.runPageSpeedAnalysis(url, 'desktop');

      // Check for performance issues
      await this.checkPerformanceThresholds(url, mobileAnalysis, 'mobile');
      await this.checkPerformanceThresholds(url, desktopAnalysis, 'desktop');

      console.log(`✅ Analysis completed for ${url}`);
      console.log(`   Mobile: ${mobileAnalysis.scores.performance}/100`);
      console.log(`   Desktop: ${desktopAnalysis.scores.performance}/100`);

    } catch (error) {
      console.error(`❌ Failed to analyze ${url}:`, error.message);
    }
  }

  async runPageSpeedAnalysis(url, strategy) {
    const response = await fetch(`${MONITORING_CONFIG.adminApiUrl}/performance-monitoring?action=pagespeed-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN}`, // You'll need to set this
      },
      body: JSON.stringify({ url, strategy })
    });

    if (!response.ok) {
      throw new Error(`PageSpeed API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  }

  async checkPerformanceThresholds(url, analysis, strategy) {
    const alerts = [];

    // Check performance score
    if (analysis.scores.performance < 50) {
      alerts.push({
        type: 'critical',
        metric: `Performance Score (${strategy})`,
        value: analysis.scores.performance,
        threshold: 90,
        message: `Performance score critique pour ${url} (${strategy}): ${analysis.scores.performance}/100`,
        url
      });
    } else if (analysis.scores.performance < 80) {
      alerts.push({
        type: 'warning',
        metric: `Performance Score (${strategy})`,
        value: analysis.scores.performance,
        threshold: 90,
        message: `Performance score faible pour ${url} (${strategy}): ${analysis.scores.performance}/100`,
        url
      });
    }

    // Check Core Web Vitals
    if (analysis.coreWebVitals.lcp > 2500) {
      alerts.push({
        type: analysis.coreWebVitals.lcp > 4000 ? 'critical' : 'warning',
        metric: `LCP (${strategy})`,
        value: analysis.coreWebVitals.lcp,
        threshold: 2500,
        message: `LCP trop élevé pour ${url} (${strategy}): ${analysis.coreWebVitals.lcp}ms`,
        url
      });
    }

    if (analysis.coreWebVitals.fid > 100) {
      alerts.push({
        type: analysis.coreWebVitals.fid > 300 ? 'critical' : 'warning',
        metric: `FID (${strategy})`,
        value: analysis.coreWebVitals.fid,
        threshold: 100,
        message: `FID trop élevé pour ${url} (${strategy}): ${analysis.coreWebVitals.fid}ms`,
        url
      });
    }

    if (analysis.coreWebVitals.cls > 0.1) {
      alerts.push({
        type: analysis.coreWebVitals.cls > 0.25 ? 'critical' : 'warning',
        metric: `CLS (${strategy})`,
        value: analysis.coreWebVitals.cls,
        threshold: 0.1,
        message: `CLS trop élevé pour ${url} (${strategy}): ${analysis.coreWebVitals.cls}`,
        url
      });
    }

    // Send alerts (with cooldown)
    for (const alert of alerts) {
      await this.sendAlertWithCooldown(alert);
    }
  }

  async checkBudgets() {
    console.log('💰 Checking performance budgets...');

    try {
      const response = await fetch(`${MONITORING_CONFIG.adminApiUrl}/performance-monitoring?action=check-budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Budget check failed: ${response.status}`);
      }

      const data = await response.json();
      const budgetCheck = data.budgetCheck;

      if (budgetCheck.overall === 'failing') {
        await this.sendAlertWithCooldown({
          type: 'critical',
          metric: 'Performance Budget',
          value: budgetCheck.violations.length,
          threshold: 0,
          message: `Budget de performance dépassé: ${budgetCheck.violations.length} violations`,
          url: MONITORING_CONFIG.baseUrl
        });
      } else if (budgetCheck.overall === 'warning') {
        await this.sendAlertWithCooldown({
          type: 'warning',
          metric: 'Performance Budget',
          value: budgetCheck.violations.length,
          threshold: 0,
          message: `Attention budget de performance: ${budgetCheck.violations.length} violations mineures`,
          url: MONITORING_CONFIG.baseUrl
        });
      }

      console.log(`✅ Budget check completed: ${budgetCheck.overall}`);

    } catch (error) {
      console.error('❌ Budget check failed:', error.message);
    }
  }

  async sendAlertWithCooldown(alert) {
    const alertKey = `${alert.metric}-${alert.url}`;
    const lastAlertTime = this.lastAlertTime.get(alertKey);
    const cooldownMs = MONITORING_CONFIG.alertCooldownMinutes * 60 * 1000;

    // Check if alert is in cooldown period
    if (lastAlertTime && (Date.now() - lastAlertTime) < cooldownMs) {
      console.log(`🔇 Alert in cooldown: ${alertKey}`);
      return;
    }

    try {
      console.log(`🚨 Sending alert: ${alert.message}`);

      // Send to monitoring system
      await this.sendMonitoringAlert(alert);

      // Update cooldown
      this.lastAlertTime.set(alertKey, Date.now());

    } catch (error) {
      console.error('❌ Failed to send alert:', error.message);
    }
  }

  async sendMonitoringAlert(alert) {
    // Send to admin API
    const response = await fetch(`${MONITORING_CONFIG.adminApiUrl}/performance-monitoring`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN}`,
      },
      body: JSON.stringify({
        action: 'store-alert',
        alert: {
          ...alert,
          id: `${alert.metric}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          resolved: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to store alert: ${response.status}`);
    }

    // Send email notification for critical alerts
    if (alert.type === 'critical') {
      await this.sendEmailAlert(alert);
    }

    // Send Slack notification if configured
    if (process.env.SLACK_WEBHOOK_URL) {
      await this.sendSlackAlert(alert);
    }
  }

  async sendEmailAlert(alert) {
    // Implementation would depend on your email service
    // This is a placeholder for email notifications
    console.log(`📧 Email alert would be sent: ${alert.message}`);
  }

  async sendSlackAlert(alert) {
    if (!process.env.SLACK_WEBHOOK_URL) return;

    const color = alert.type === 'critical' ? 'danger' : 
                  alert.type === 'warning' ? 'warning' : 'good';

    const slackMessage = {
      attachments: [{
        color,
        title: `Performance Alert: ${alert.metric}`,
        text: alert.message,
        fields: [
          {
            title: 'Value',
            value: alert.value.toString(),
            short: true
          },
          {
            title: 'Threshold',
            value: alert.threshold.toString(),
            short: true
          },
          {
            title: 'URL',
            value: alert.url || 'N/A',
            short: false
          }
        ],
        footer: 'OMA Digital Performance Monitoring',
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    try {
      const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage)
      });

      if (!response.ok) {
        throw new Error(`Slack notification failed: ${response.status}`);
      }

      console.log('📱 Slack notification sent');
    } catch (error) {
      console.error('❌ Failed to send Slack notification:', error.message);
    }
  }

  async cleanupOldData() {
    console.log('🧹 Running daily cleanup...');

    try {
      const response = await fetch(`${MONITORING_CONFIG.adminApiUrl}/performance-monitoring?action=cleanup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN}`,
        }
      });

      if (response.ok) {
        console.log('✅ Data cleanup completed');
      } else {
        console.log('⚠️ Data cleanup failed');
      }
    } catch (error) {
      console.error('❌ Cleanup error:', error.message);
    }
  }

  shouldRunDailyCleanup() {
    const now = new Date();
    // Run cleanup at 2 AM
    return now.getHours() === 2 && now.getMinutes() < MONITORING_CONFIG.checkIntervalMinutes;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  console.log('🔥 OMA Digital Performance Monitoring Cron Job');
  console.log('================================================');

  // Validate required environment variables
  if (!process.env['GOOGLE_PAGESPEED_API_KEY']) {
    console.error('❌ GOOGLE_PAGESPEED_API_KEY environment variable is required');
    process.exit(1);
  }

  if (!process.env.ADMIN_API_TOKEN) {
    console.error('❌ ADMIN_API_TOKEN environment variable is required');
    process.exit(1);
  }

  const monitor = new PerformanceMonitoringCron();
  
  try {
    await monitor.run();
    console.log('🎉 Monitoring completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('💥 Monitoring failed:', error);
    process.exit(1);
  }
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  console.log('\n⏹️  Monitoring interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Monitoring terminated');
  process.exit(0);
});

// Run the monitoring
if (require.main === module) {
  main();
}

module.exports = PerformanceMonitoringCron;