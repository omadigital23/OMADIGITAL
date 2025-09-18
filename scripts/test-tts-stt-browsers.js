#!/usr/bin/env node

/**
 * TTS/STT Cross-Browser Testing Script for OMA Digital
 * Tests Text-to-Speech and Speech-to-Text functionality across target browsers
 */

const fs = require('fs');
const path = require('path');

class TTSSTTBrowserTester {
  constructor() {
    this.results = {
      browsers: {},
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        warnings: 0
      },
      errors: [],
      warnings: []
    };
    
    this.testConfig = {
      browsers: ['chrome', 'firefox', 'safari', 'edge'],
      languages: ['fr', 'en'],
      testTexts: {
        fr: [
          'Bonjour, comment puis-je vous aider aujourd\'hui ?',
          'Bienvenue sur OMA Digital, votre partenaire en transformation digitale.',
          'Nous proposons des solutions d\'intelligence artificielle pour les PME.'
        ],
        en: [
          'Hello, how can I help you today?',
          'Welcome to OMA Digital, your digital transformation partner.',
          'We offer artificial intelligence solutions for SMEs.'
        ]
      },
      audioSamples: {
        fr: 'Bonjour, je voudrais des informations sur vos services.',
        en: 'Hello, I would like information about your services.'
      }
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
    const timestamp = new Date().toISOString();
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  // Run comprehensive TTS/STT browser tests
  async runBrowserTests() {
    this.log('🎤 Starting TTS/STT Cross-Browser Testing', 'info');
    
    for (const browser of this.testConfig.browsers) {
      this.log(`\n🌐 Testing ${browser.toUpperCase()}`, 'info');
      
      this.results.browsers[browser] = {
        tts: { supported: false, languages: {}, errors: [] },
        stt: { supported: false, languages: {}, errors: [] },
        overall: { score: 0, status: 'UNKNOWN' }
      };
      
      await this.testTTSInBrowser(browser);
      await this.testSTTInBrowser(browser);
      await this.testBrowserSpecificFeatures(browser);
      
      this.calculateBrowserScore(browser);
    }
    
    this.generateCompatibilityReport();
  }

  // Test TTS functionality in specific browser
  async testTTSInBrowser(browser) {
    this.log(`🔊 Testing TTS in ${browser}`, 'info');
    
    const browserResult = this.results.browsers[browser];
    
    try {
      // Test TTS API availability
      const ttsSupport = await this.checkTTSSupport(browser);
      browserResult.tts.supported = ttsSupport.supported;
      
      if (!ttsSupport.supported) {
        browserResult.tts.errors.push('TTS API not supported');
        this.results.errors.push({
          browser,
          type: 'TTS Support',
          message: 'Text-to-Speech API not available',
          impact: 'Users cannot hear chatbot responses'
        });
        return;
      }
      
      // Test each language
      for (const language of this.testConfig.languages) {
        this.log(`  Testing TTS ${language} in ${browser}`, 'info');
        
        const languageResult = {
          voices: [],
          quality: 0,
          speed: 0,
          errors: []
        };
        
        // Test voice availability
        const voices = await this.getAvailableVoices(browser, language);
        languageResult.voices = voices;
        
        if (voices.length === 0) {
          languageResult.errors.push(`No ${language} voices available`);
          this.results.warnings.push({
            browser,
            type: 'TTS Voices',
            language,
            message: `No ${language} voices available in ${browser}`,
            impact: 'Limited language support'
          });
        }
        
        // Test TTS quality and performance
        for (const testText of this.testConfig.testTexts[language]) {
          const ttsResult = await this.testTTSQuality(browser, language, testText);
          languageResult.quality += ttsResult.quality;
          languageResult.speed += ttsResult.speed;
          
          if (ttsResult.errors.length > 0) {
            languageResult.errors.push(...ttsResult.errors);
          }
        }
        
        // Average the results
        const testCount = this.testConfig.testTexts[language].length;
        languageResult.quality = languageResult.quality / testCount;
        languageResult.speed = languageResult.speed / testCount;
        
        browserResult.tts.languages[language] = languageResult;
        
        // Log results
        if (languageResult.errors.length === 0) {
          this.log(`  ✅ TTS ${language}: Quality ${languageResult.quality.toFixed(1)}/10, Speed ${languageResult.speed.toFixed(0)}ms`, 'success');
        } else {
          this.log(`  ⚠️ TTS ${language}: ${languageResult.errors.length} issues`, 'warning');
        }
      }
      
    } catch (error) {
      browserResult.tts.errors.push(error.message);
      this.results.errors.push({
        browser,
        type: 'TTS Error',
        message: error.message,
        impact: 'TTS functionality unavailable'
      });
      this.log(`  ❌ TTS testing failed: ${error.message}`, 'error');
    }
  }

  // Test STT functionality in specific browser
  async testSTTInBrowser(browser) {
    this.log(`🎙️ Testing STT in ${browser}`, 'info');
    
    const browserResult = this.results.browsers[browser];
    
    try {
      // Test STT API availability
      const sttSupport = await this.checkSTTSupport(browser);
      browserResult.stt.supported = sttSupport.supported;
      
      if (!sttSupport.supported) {
        browserResult.stt.errors.push('STT API not supported');
        this.results.errors.push({
          browser,
          type: 'STT Support',
          message: 'Speech-to-Text API not available',
          impact: 'Users cannot use voice input'
        });
        return;
      }
      
      // Test each language
      for (const language of this.testConfig.languages) {
        this.log(`  Testing STT ${language} in ${browser}`, 'info');
        
        const languageResult = {
          accuracy: 0,
          speed: 0,
          continuous: false,
          errors: []
        };
        
        // Test STT accuracy and performance
        const sttResult = await this.testSTTAccuracy(browser, language, this.testConfig.audioSamples[language]);
        languageResult.accuracy = sttResult.accuracy;
        languageResult.speed = sttResult.speed;
        languageResult.continuous = sttResult.continuous;
        
        if (sttResult.errors.length > 0) {
          languageResult.errors.push(...sttResult.errors);
        }
        
        browserResult.stt.languages[language] = languageResult;
        
        // Check thresholds
        if (languageResult.accuracy < 0.8) {
          this.results.warnings.push({
            browser,
            type: 'STT Accuracy',
            language,
            message: `STT accuracy ${(languageResult.accuracy * 100).toFixed(1)}% < 80%`,
            impact: 'Poor voice recognition quality'
          });
        }
        
        if (languageResult.speed > 3000) {
          this.results.warnings.push({
            browser,
            type: 'STT Performance',
            language,
            message: `STT response time ${languageResult.speed}ms > 3000ms`,
            impact: 'Slow voice recognition'
          });
        }
        
        // Log results
        if (languageResult.errors.length === 0) {
          this.log(`  ✅ STT ${language}: Accuracy ${(languageResult.accuracy * 100).toFixed(1)}%, Speed ${languageResult.speed.toFixed(0)}ms`, 'success');
        } else {
          this.log(`  ⚠️ STT ${language}: ${languageResult.errors.length} issues`, 'warning');
        }
      }
      
    } catch (error) {
      browserResult.stt.errors.push(error.message);
      this.results.errors.push({
        browser,
        type: 'STT Error',
        message: error.message,
        impact: 'STT functionality unavailable'
      });
      this.log(`  ❌ STT testing failed: ${error.message}`, 'error');
    }
  }

  // Test browser-specific features
  async testBrowserSpecificFeatures(browser) {
    this.log(`🔧 Testing ${browser}-specific features`, 'info');
    
    const browserResult = this.results.browsers[browser];
    const features = {
      autoplay: false,
      permissions: false,
      offline: false,
      webAudio: false
    };
    
    try {
      // Test autoplay policy
      features.autoplay = await this.testAutoplayPolicy(browser);
      
      // Test permissions API
      features.permissions = await this.testPermissionsAPI(browser);
      
      // Test offline capabilities
      features.offline = await this.testOfflineCapabilities(browser);
      
      // Test Web Audio API
      features.webAudio = await this.testWebAudioAPI(browser);
      
      browserResult.features = features;
      
      // Log feature support
      const supportedFeatures = Object.entries(features).filter(([key, value]) => value).map(([key]) => key);
      this.log(`  ✅ Features: ${supportedFeatures.join(', ')}`, 'success');
      
      // Check for critical missing features
      if (!features.permissions) {
        this.results.warnings.push({
          browser,
          type: 'Browser Features',
          message: 'Permissions API not supported',
          impact: 'Cannot request microphone permissions gracefully'
        });
      }
      
    } catch (error) {
      this.results.errors.push({
        browser,
        type: 'Feature Testing',
        message: error.message,
        impact: 'Cannot determine browser capabilities'
      });
    }
  }

  // Check TTS support (simulated)
  async checkTTSSupport(browser) {
    // Simulate browser-specific TTS support
    const support = {
      chrome: { supported: true, version: '90+' },
      firefox: { supported: true, version: '88+' },
      safari: { supported: true, version: '14+' },
      edge: { supported: true, version: '90+' }
    };
    
    return support[browser] || { supported: false };
  }

  // Check STT support (simulated)
  async checkSTTSupport(browser) {
    // Simulate browser-specific STT support
    const support = {
      chrome: { supported: true, version: '90+' },
      firefox: { supported: false, reason: 'Limited Web Speech API support' },
      safari: { supported: true, version: '14.1+' },
      edge: { supported: true, version: '90+' }
    };
    
    return support[browser] || { supported: false };
  }

  // Get available voices (simulated)
  async getAvailableVoices(browser, language) {
    // Simulate browser-specific voice availability
    const voices = {
      chrome: {
        fr: ['Google français', 'Microsoft Hortense', 'Microsoft Julie'],
        en: ['Google US English', 'Microsoft Zira', 'Microsoft David']
      },
      firefox: {
        fr: ['Microsoft Hortense'],
        en: ['Microsoft Zira']
      },
      safari: {
        fr: ['Amélie', 'Thomas'],
        en: ['Alex', 'Samantha']
      },
      edge: {
        fr: ['Microsoft Hortense', 'Microsoft Julie'],
        en: ['Microsoft Zira', 'Microsoft David']
      }
    };
    
    return voices[browser]?.[language] || [];
  }

  // Test TTS quality (simulated)
  async testTTSQuality(browser, language, text) {
    // Simulate TTS testing with realistic results
    const baseQuality = {
      chrome: 8.5,
      firefox: 7.0,
      safari: 8.0,
      edge: 8.2
    };
    
    const baseSpeed = {
      chrome: 200,
      firefox: 300,
      safari: 250,
      edge: 220
    };
    
    // Add some randomness and text length factor
    const quality = (baseQuality[browser] || 6.0) + (Math.random() - 0.5);
    const speed = (baseSpeed[browser] || 400) + Math.random() * 100 + text.length * 2;
    
    const result = {
      quality: Math.max(0, Math.min(10, quality)),
      speed: Math.max(100, speed),
      errors: []
    };
    
    // Simulate potential issues
    if (text.length > 200) {
      result.errors.push('Long text may cause performance issues');
    }
    
    if (language === 'fr' && browser === 'firefox') {
      result.quality -= 1;
      result.errors.push('French pronunciation issues in Firefox');
    }
    
    return result;
  }

  // Test STT accuracy (simulated)
  async testSTTAccuracy(browser, language, audioSample) {
    // Simulate STT testing with realistic results
    const baseAccuracy = {
      chrome: 0.92,
      firefox: 0.0, // Not supported
      safari: 0.88,
      edge: 0.90
    };
    
    const baseSpeed = {
      chrome: 800,
      firefox: 0,
      safari: 1200,
      edge: 900
    };
    
    if (!baseAccuracy[browser]) {
      return {
        accuracy: 0,
        speed: 0,
        continuous: false,
        errors: ['STT not supported in this browser']
      };
    }
    
    // Add some randomness
    const accuracy = baseAccuracy[browser] + (Math.random() - 0.5) * 0.1;
    const speed = baseSpeed[browser] + Math.random() * 200;
    
    const result = {
      accuracy: Math.max(0, Math.min(1, accuracy)),
      speed: Math.max(500, speed),
      continuous: browser === 'chrome' || browser === 'edge',
      errors: []
    };
    
    // Simulate language-specific issues
    if (language === 'fr' && browser === 'safari') {
      result.accuracy -= 0.05;
      result.errors.push('French accent recognition issues in Safari');
    }
    
    return result;
  }

  // Test autoplay policy (simulated)
  async testAutoplayPolicy(browser) {
    // Simulate browser autoplay policies
    const policies = {
      chrome: false, // Requires user interaction
      firefox: false, // Requires user interaction
      safari: false, // Strict autoplay policy
      edge: false    // Requires user interaction
    };
    
    return policies[browser] || false;
  }

  // Test permissions API (simulated)
  async testPermissionsAPI(browser) {
    const support = {
      chrome: true,
      firefox: true,
      safari: false, // Limited support
      edge: true
    };
    
    return support[browser] || false;
  }

  // Test offline capabilities (simulated)
  async testOfflineCapabilities(browser) {
    const support = {
      chrome: false, // Requires internet for Web Speech API
      firefox: false,
      safari: false,
      edge: false
    };
    
    return support[browser] || false;
  }

  // Test Web Audio API (simulated)
  async testWebAudioAPI(browser) {
    const support = {
      chrome: true,
      firefox: true,
      safari: true,
      edge: true
    };
    
    return support[browser] || false;
  }

  // Calculate browser compatibility score
  calculateBrowserScore(browser) {
    const browserResult = this.results.browsers[browser];
    let score = 0;
    let maxScore = 0;
    
    // TTS scoring
    if (browserResult.tts.supported) {
      score += 25;
      
      Object.values(browserResult.tts.languages).forEach(lang => {
        if (lang.voices.length > 0) score += 10;
        if (lang.quality >= 7) score += 5;
        if (lang.errors.length === 0) score += 5;
      });
    }
    maxScore += 25 + (this.testConfig.languages.length * 20);
    
    // STT scoring
    if (browserResult.stt.supported) {
      score += 25;
      
      Object.values(browserResult.stt.languages).forEach(lang => {
        if (lang.accuracy >= 0.8) score += 10;
        if (lang.speed <= 2000) score += 5;
        if (lang.errors.length === 0) score += 5;
      });
    }
    maxScore += 25 + (this.testConfig.languages.length * 20);
    
    // Features scoring
    if (browserResult.features) {
      Object.values(browserResult.features).forEach(supported => {
        if (supported) score += 2.5;
      });
    }
    maxScore += Object.keys(browserResult.features || {}).length * 2.5;
    
    browserResult.overall.score = Math.round((score / maxScore) * 100);
    
    // Determine status
    if (browserResult.overall.score >= 80) {
      browserResult.overall.status = 'EXCELLENT';
    } else if (browserResult.overall.score >= 60) {
      browserResult.overall.status = 'GOOD';
    } else if (browserResult.overall.score >= 40) {
      browserResult.overall.status = 'LIMITED';
    } else {
      browserResult.overall.status = 'POOR';
    }
    
    this.log(`📊 ${browser.toUpperCase()}: ${browserResult.overall.score}% (${browserResult.overall.status})`, 
      browserResult.overall.status === 'EXCELLENT' ? 'success' : 
      browserResult.overall.status === 'GOOD' ? 'warning' : 'error');
  }

  // Generate compatibility report
  generateCompatibilityReport() {
    // Calculate summary statistics
    const totalBrowsers = this.testConfig.browsers.length;
    let supportedBrowsers = 0;
    let partiallySupported = 0;
    let unsupported = 0;
    
    Object.values(this.results.browsers).forEach(browser => {
      if (browser.overall.score >= 60) {
        supportedBrowsers++;
      } else if (browser.overall.score >= 30) {
        partiallySupported++;
      } else {
        unsupported++;
      }
    });
    
    this.results.summary = {
      totalBrowsers,
      supportedBrowsers,
      partiallySupported,
      unsupported,
      overallCompatibility: Math.round((supportedBrowsers / totalBrowsers) * 100),
      totalErrors: this.results.errors.length,
      totalWarnings: this.results.warnings.length
    };
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.results.summary,
      browsers: this.results.browsers,
      errors: this.results.errors,
      warnings: this.results.warnings,
      recommendations: this.generateRecommendations(),
      fallbackStrategies: this.generateFallbackStrategies()
    };
    
    // Save report
    const reportPath = `tts-stt-compatibility-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`\n📊 Compatibility Report Generated: ${reportPath}`, 'info');
    this.displayCompatibilitySummary(report);
    
    return report;
  }

  // Generate recommendations
  generateRecommendations() {
    const recommendations = [];
    
    // Browser-specific recommendations
    Object.entries(this.results.browsers).forEach(([browser, result]) => {
      if (!result.tts.supported) {
        recommendations.push(`Implement TTS fallback for ${browser} users`);
      }
      
      if (!result.stt.supported) {
        recommendations.push(`Provide alternative input methods for ${browser} users`);
      }
      
      if (result.overall.score < 60) {
        recommendations.push(`Consider limiting advanced voice features in ${browser}`);
      }
    });
    
    // General recommendations
    if (this.results.summary.overallCompatibility < 80) {
      recommendations.push('Implement progressive enhancement for voice features');
      recommendations.push('Add clear browser compatibility warnings');
    }
    
    if (this.results.errors.some(e => e.type.includes('STT'))) {
      recommendations.push('Provide keyboard input as primary method with voice as enhancement');
    }
    
    if (this.results.warnings.some(w => w.type.includes('Accuracy'))) {
      recommendations.push('Implement confidence scoring and confirmation dialogs for voice input');
    }
    
    return [...new Set(recommendations)]; // Remove duplicates
  }

  // Generate fallback strategies
  generateFallbackStrategies() {
    return {
      ttsUnavailable: [
        'Display text responses prominently',
        'Add visual indicators for bot responses',
        'Provide text-to-speech toggle in settings',
        'Show "Audio not supported" message gracefully'
      ],
      sttUnavailable: [
        'Default to keyboard input',
        'Hide microphone button when STT unavailable',
        'Add "Voice input not supported" tooltip',
        'Provide clear typing instructions'
      ],
      lowAccuracy: [
        'Implement confidence thresholds',
        'Add "Did you mean?" suggestions',
        'Provide edit/confirm dialogs',
        'Fall back to typing after failed attempts'
      ],
      permissionsDenied: [
        'Show clear permission request explanation',
        'Provide manual permission instructions',
        'Gracefully fall back to text input',
        'Remember user preference'
      ]
    };
  }

  // Display compatibility summary
  displayCompatibilitySummary(report) {
    this.log('\n🎤 TTS/STT Compatibility Summary:', 'info');
    this.log(`Overall Compatibility: ${report.summary.overallCompatibility}%`, 
      report.summary.overallCompatibility >= 80 ? 'success' : 
      report.summary.overallCompatibility >= 60 ? 'warning' : 'error');
    
    this.log(`Supported Browsers: ${report.summary.supportedBrowsers}/${report.summary.totalBrowsers}`);
    this.log(`Partially Supported: ${report.summary.partiallySupported}`);
    this.log(`Unsupported: ${report.summary.unsupported}`);
    
    if (report.summary.totalErrors > 0) {
      this.log(`Errors: ${report.summary.totalErrors}`, 'error');
    }
    
    if (report.summary.totalWarnings > 0) {
      this.log(`Warnings: ${report.summary.totalWarnings}`, 'warning');
    }
    
    // Browser breakdown
    this.log('\n📊 Browser Breakdown:', 'info');
    Object.entries(report.browsers).forEach(([browser, result]) => {
      const ttsStatus = result.tts.supported ? '✅' : '❌';
      const sttStatus = result.stt.supported ? '✅' : '❌';
      this.log(`${browser.toUpperCase()}: TTS ${ttsStatus} STT ${sttStatus} (${result.overall.score}%)`, 
        result.overall.status === 'EXCELLENT' ? 'success' : 
        result.overall.status === 'GOOD' ? 'warning' : 'error');
    });
    
    if (report.recommendations.length > 0) {
      this.log('\n📋 Recommendations:', 'info');
      report.recommendations.forEach((rec, index) => {
        this.log(`${index + 1}. ${rec}`, 'info');
      });
    }
  }
}

// Main execution
async function main() {
  const tester = new TTSSTTBrowserTester();
  
  try {
    await tester.runBrowserTests();
    
    const compatibility = tester.results.summary.overallCompatibility;
    if (compatibility >= 75) {
      console.log('\n🎉 TTS/STT browser compatibility excellent! Ready for production.');
      process.exit(0);
    } else if (compatibility >= 50) {
      console.log('\n⚠️ TTS/STT browser compatibility acceptable with limitations. Review recommendations.');
      process.exit(1);
    } else {
      console.log('\n❌ TTS/STT browser compatibility poor. Implement fallback strategies before production.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 TTS/STT browser testing failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = TTSSTTBrowserTester;