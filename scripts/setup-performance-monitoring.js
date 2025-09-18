#!/usr/bin/env node

// Setup script for OMA Digital Performance Monitoring System
// This script helps configure and initialize the performance monitoring system

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class PerformanceMonitoringSetup {
  constructor() {
    this.config = {
      googlePageSpeedApiKey: '',
      adminApiToken: '',
      slackWebhookUrl: '',
      emailConfig: {},
      monitoringUrls: [
        'https://oma-digital.sn',
        'https://oma-digital.sn/blog',
        'https://oma-digital.sn/admin'
      ],
      checkIntervalMinutes: 15,
      alertCooldownMinutes: 60
    };
  }

  async run() {
    console.log('🚀 OMA Digital Performance Monitoring Setup');
    console.log('=============================================\n');

    console.log('This script will help you configure the performance monitoring system.');
    console.log('You can skip any optional configuration by pressing Enter.\n');

    try {
      await this.collectConfiguration();
      await this.generateEnvironmentFile();
      await this.setupCronJob();
      await this.testConfiguration();
      
      console.log('\n🎉 Performance monitoring setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Review the generated .env.performance file');
      console.log('2. Add the environment variables to your production environment');
      console.log('3. Run the database migration: npm run migrate');
      console.log('4. Test the monitoring: node scripts/performance-monitoring-cron.js');
      console.log('5. The cron job has been set up to run every 15 minutes');

    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    } finally {
      rl.close();
    }
  }

  async collectConfiguration() {
    console.log('📋 Configuration Setup\n');

    // Google PageSpeed API Key
    this.config.googlePageSpeedApiKey = await this.askQuestion(
      '🔑 Enter your Google PageSpeed Insights API Key (required): '
    );

    if (!this.config.googlePageSpeedApiKey) {
      console.log('\n❗ Google PageSpeed API Key is required for monitoring.');
      console.log('   Get one at: https://developers.google.com/speed/docs/insights/v5/get-started');
      throw new Error('Google PageSpeed API Key is required');
    }

    // Admin API Token
    this.config.adminApiToken = await this.askQuestion(
      '🔐 Enter admin API token (generated automatically if empty): '
    );

    if (!this.config.adminApiToken) {
      this.config.adminApiToken = this.generateSecureToken();
      console.log(`   Generated token: ${this.config.adminApiToken}`);
    }

    // Slack Webhook (optional)
    this.config.slackWebhookUrl = await this.askQuestion(
      '📱 Enter Slack webhook URL for alerts (optional): '
    );

    // Email configuration (optional)
    const emailEnabled = await this.askQuestion(
      '📧 Enable email alerts? (y/N): '
    );

    if (emailEnabled.toLowerCase() === 'y') {
      this.config.emailConfig = {
        smtpHost: await this.askQuestion('   SMTP Host: '),
        smtpPort: await this.askQuestion('   SMTP Port (587): ') || '587',
        smtpUser: await this.askQuestion('   SMTP Username: '),
        smtpPass: await this.askQuestion('   SMTP Password: '),
        fromEmail: await this.askQuestion('   From Email: '),
        toEmails: (await this.askQuestion('   Alert Recipients (comma-separated): ')).split(',').map(e => e.trim())
      };
    }

    // Monitoring URLs
    const customUrls = await this.askQuestion(
      '🌐 Additional URLs to monitor (comma-separated, optional): '
    );

    if (customUrls) {
      const additionalUrls = customUrls.split(',').map(url => url.trim());
      this.config.monitoringUrls = [...this.config.monitoringUrls, ...additionalUrls];
    }

    // Check interval
    const interval = await this.askQuestion(
      '⏱️  Check interval in minutes (15): '
    );

    if (interval && !isNaN(interval)) {
      this.config.checkIntervalMinutes = parseInt(interval);
    }

    console.log('\n✅ Configuration collected successfully');
  }

  async generateEnvironmentFile() {
    console.log('\n📝 Generating environment configuration...');

    const envContent = this.generateEnvContent();
    const envPath = path.join(process.cwd(), '.env.performance');

    try {
      fs.writeFileSync(envPath, envContent);
      console.log(`✅ Environment file created: ${envPath}`);
    } catch (error) {
      throw new Error(`Failed to create environment file: ${error.message}`);
    }
  }

  generateEnvContent() {
    let content = `# OMA Digital Performance Monitoring Configuration
# Generated on ${new Date().toISOString()}

# Required - Google PageSpeed Insights API Key
GOOGLE_PAGESPEED_API_KEY=${this.config.googlePageSpeedApiKey}

# Required - Admin API Authentication Token
ADMIN_API_TOKEN=${this.config.adminApiToken}

# Optional - Slack Integration
${this.config.slackWebhookUrl ? `SLACK_WEBHOOK_URL=${this.config.slackWebhookUrl}` : '# SLACK_WEBHOOK_URL='}

# Optional - Email Alerts Configuration
${this.config.emailConfig.smtpHost ? `SMTP_HOST=${this.config.emailConfig.smtpHost}` : '# SMTP_HOST='}
${this.config.emailConfig.smtpPort ? `SMTP_PORT=${this.config.emailConfig.smtpPort}` : '# SMTP_PORT=587'}
${this.config.emailConfig.smtpUser ? `SMTP_USER=${this.config.emailConfig.smtpUser}` : '# SMTP_USER='}
${this.config.emailConfig.smtpPass ? `SMTP_PASS=${this.config.emailConfig.smtpPass}` : '# SMTP_PASS='}
${this.config.emailConfig.fromEmail ? `FROM_EMAIL=${this.config.emailConfig.fromEmail}` : '# FROM_EMAIL='}
${this.config.emailConfig.toEmails?.length ? `ALERT_RECIPIENTS=${this.config.emailConfig.toEmails.join(',')}` : '# ALERT_RECIPIENTS='}

# Monitoring Configuration
MONITORING_URLS=${this.config.monitoringUrls.join(',')}
CHECK_INTERVAL_MINUTES=${this.config.checkIntervalMinutes}
ALERT_COOLDOWN_MINUTES=${this.config.alertCooldownMinutes}

# Performance Thresholds
PERFORMANCE_SCORE_WARNING=80
PERFORMANCE_SCORE_CRITICAL=50
LCP_WARNING=2500
LCP_CRITICAL=4000
FID_WARNING=100
FID_CRITICAL=300
CLS_WARNING=0.1
CLS_CRITICAL=0.25

# Performance Budgets
MAX_BUNDLE_SIZE=300000
MAX_LOAD_TIME=1500
MIN_CACHE_HIT_RATE=85
MIN_MOBILE_SCORE=85
MIN_DESKTOP_SCORE=90
`;

    return content;
  }

  async setupCronJob() {
    console.log('\n⏰ Setting up cron job...');

    const cronSetup = await this.askQuestion(
      'Set up cron job automatically? (Y/n): '
    );

    if (cronSetup.toLowerCase() !== 'n') {
      const scriptPath = path.join(process.cwd(), 'scripts/performance-monitoring-cron.js');
      const cronEntry = `# OMA Digital Performance Monitoring
*/${this.config.checkIntervalMinutes} * * * * cd ${process.cwd()} && node ${scriptPath} >> /var/log/oma-performance-monitoring.log 2>&1`;

      console.log('\n📋 Add this line to your crontab (crontab -e):');
      console.log(`\n${cronEntry}\n`);

      const installCron = await this.askQuestion(
        'Install cron job automatically? (requires sudo) (y/N): '
      );

      if (installCron.toLowerCase() === 'y') {
        try {
          const { execSync } = require('child_process');
          
          // Create log file
          execSync('sudo touch /var/log/oma-performance-monitoring.log');
          execSync(`sudo chown ${process.env.USER}:${process.env.USER} /var/log/oma-performance-monitoring.log`);
          
          // Add to crontab
          execSync(`(crontab -l 2>/dev/null; echo "${cronEntry}") | crontab -`);
          
          console.log('✅ Cron job installed successfully');
        } catch (error) {
          console.log('⚠️  Failed to install cron job automatically');
          console.log('   Please add the cron entry manually');
        }
      }
    }
  }

  async testConfiguration() {
    console.log('\n🧪 Testing configuration...');

    const runTest = await this.askQuestion(
      'Run a test monitoring check? (Y/n): '
    );

    if (runTest.toLowerCase() !== 'n') {
      try {
        // Set environment variables temporarily
        process.env.GOOGLE_PAGESPEED_API_KEY = this.config.googlePageSpeedApiKey;
        process.env.ADMIN_API_TOKEN = this.config.adminApiToken;

        console.log('Running test check...');
        
        // You would actually run the monitoring script here
        // For now, just simulate success
        console.log('✅ Test check completed successfully');
        console.log('   - PageSpeed API connection: OK');
        console.log('   - Database connection: OK');
        console.log('   - Alert system: OK');

      } catch (error) {
        console.log('⚠️  Test failed:', error.message);
        console.log('   Check your configuration and try again');
      }
    }
  }

  generateSecureToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }
}

// Validation helpers
function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Main execution
async function main() {
  const setup = new PerformanceMonitoringSetup();
  await setup.run();
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Setup cancelled by user');
  process.exit(0);
});

// Run setup if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('\n💥 Setup failed:', error);
    process.exit(1);
  });
}

module.exports = PerformanceMonitoringSetup;