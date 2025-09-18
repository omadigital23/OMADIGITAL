// Monitoring utilities for language detection accuracy and response quality

interface LanguageDetectionMetrics {
  totalRequests: number;
  correctDetections: number;
  incorrectDetections: number;
  ambiguousCases: number;
  frenchRequests: number;
  englishRequests: number;
  detectionAccuracy: number;
}

interface ResponseQualityMetrics {
  totalResponses: number;
  avgResponseTime: number;
  avgResponseLength: number;
  suggestionUsage: number;
  ctaUsage: number;
  fallbackUsage: number;
  userSatisfaction: number;
}

interface ChatbotAnalytics {
  sessionId: string;
  timestamp: Date;
  languageDetection: LanguageDetectionMetrics;
  responseQuality: ResponseQualityMetrics;
  userAgent: string;
  ipAddress: string;
}

interface AnalyticsData {
  languageDetection: {
    accuracy: number;
    totalRequests: number;
    correctRate: number;
    ambiguousRate: number;
    frenchPercentage: number;
    englishPercentage: number;
  };
  responseQuality: {
    avgResponseTime: number;
    avgResponseLength: number;
    totalResponses: number;
    suggestionUsageRate: number;
    ctaUsageRate: number;
    fallbackRate: number;
    userSatisfaction: number;
  };
  generatedAt: string;
}

class ChatbotMonitoring {
  private metrics: {
    languageDetection: LanguageDetectionMetrics;
    responseQuality: ResponseQualityMetrics;
  };

  constructor() {
    this.metrics = {
      languageDetection: {
        totalRequests: 0,
        correctDetections: 0,
        incorrectDetections: 0,
        ambiguousCases: 0,
        frenchRequests: 0,
        englishRequests: 0,
        detectionAccuracy: 0
      },
      responseQuality: {
        totalResponses: 0,
        avgResponseTime: 0,
        avgResponseLength: 0,
        suggestionUsage: 0,
        ctaClicks: 0,
        fallbackUsage: 0,
        userSatisfaction: 0
      }
    };
  }

  /**
   * Track language detection accuracy
   */
  trackLanguageDetection(userLanguage: 'fr' | 'en', detectedLanguage: 'fr' | 'en', confidence: number) {
    this.metrics.languageDetection.totalRequests++;
    
    if (userLanguage === detectedLanguage) {
      this.metrics.languageDetection.correctDetections++;
    } else {
      this.metrics.languageDetection.incorrectDetections++;
    }
    
    if (confidence < 0.7) {
      this.metrics.languageDetection.ambiguousCases++;
    }
    
    if (userLanguage === 'fr') {
      this.metrics.languageDetection.frenchRequests++;
    } else {
      this.metrics.languageDetection.englishRequests++;
    }
    
    // Update accuracy percentage
    this.metrics.languageDetection.detectionAccuracy = 
      this.metrics.languageDetection.totalRequests > 0 
        ? (this.metrics.languageDetection.correctDetections / this.metrics.languageDetection.totalRequests) * 100 
        : 0;
  }

  /**
   * Track response quality metrics
   */
  trackResponseQuality(responseTime: number, responseLength: number, hasSuggestions: boolean, hasCTA: boolean, isFallback: boolean) {
    this.metrics.responseQuality.totalResponses++;
    
    // Update average response time
    this.metrics.responseQuality.avgResponseTime = 
      ((this.metrics.responseQuality.avgResponseTime * (this.metrics.responseQuality.totalResponses - 1)) + responseTime) / 
      this.metrics.responseQuality.totalResponses;
    
    // Update average response length
    this.metrics.responseQuality.avgResponseLength = 
      ((this.metrics.responseQuality.avgResponseLength * (this.metrics.responseQuality.totalResponses - 1)) + responseLength) / 
      this.metrics.responseQuality.totalResponses;
    
    // Track suggestion usage
    if (hasSuggestions) {
      this.metrics.responseQuality.suggestionUsage++;
    }
    
    // Track CTA usage
    if (hasCTA) {
      this.metrics.responseQuality.ctaUsage++;
    }
    
    // Track fallback usage
    if (isFallback) {
      this.metrics.responseQuality.fallbackUsage++;
    }
  }

  /**
   * Track user satisfaction (to be called when user provides feedback)
   */
  trackUserSatisfaction(rating: number) {
    // Increment total responses for satisfaction tracking
    this.metrics.responseQuality.totalResponses = Math.max(this.metrics.responseQuality.totalResponses, 1);
    
    // Update user satisfaction average
    this.metrics.responseQuality.userSatisfaction = 
      ((this.metrics.responseQuality.userSatisfaction * (this.metrics.responseQuality.totalResponses - 1)) + rating) / 
      this.metrics.responseQuality.totalResponses;
  }

  /**
   * Get current metrics
   */
  getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      languageDetection: {
        totalRequests: 0,
        correctDetections: 0,
        incorrectDetections: 0,
        ambiguousCases: 0,
        frenchRequests: 0,
        englishRequests: 0,
        detectionAccuracy: 0
      },
      responseQuality: {
        totalResponses: 0,
        avgResponseTime: 0,
        avgResponseLength: 0,
        suggestionUsage: 0,
        ctaClicks: 0,
        fallbackUsage: 0,
        userSatisfaction: 0
      }
    };
  }

  /**
   * Generate a report of current metrics
   */
  generateReport(): string {
    const langMetrics = this.metrics.languageDetection;
    const respMetrics = this.metrics.responseQuality;
    
    return `
Chatbot Monitoring Report
=========================

Language Detection:
- Total Requests: ${langMetrics.totalRequests}
- Detection Accuracy: ${langMetrics.detectionAccuracy.toFixed(2)}%
- Correct Detections: ${langMetrics.correctDetections}
- Incorrect Detections: ${langMetrics.incorrectDetections}
- Ambiguous Cases: ${langMetrics.ambiguousCases}
- French Requests: ${langMetrics.frenchRequests}
- English Requests: ${langMetrics.englishRequests}

Response Quality:
- Total Responses: ${respMetrics.totalResponses}
- Average Response Time: ${respMetrics.avgResponseTime.toFixed(2)}ms
- Average Response Length: ${respMetrics.avgResponseLength.toFixed(2)} characters
- Suggestions Used: ${respMetrics.suggestionUsage}
- CTAs Used: ${respMetrics.ctaUsage}
- Fallback Responses: ${respMetrics.fallbackUsage}
- User Satisfaction: ${respMetrics.userSatisfaction.toFixed(2)}/5

Generated at: ${new Date().toISOString()}
    `;
  }

  /**
   * Export metrics as JSON for deeper analysis
   */
  exportMetrics(): string {
    return JSON.stringify({
      ...this.metrics,
      generatedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  /**
   * Get metrics in a format suitable for analytics dashboards
   */
  getAnalyticsData(): AnalyticsData {
    const langMetrics = this.metrics.languageDetection;
    const respMetrics = this.metrics.responseQuality;
    
    return {
      languageDetection: {
        accuracy: langMetrics.detectionAccuracy,
        totalRequests: langMetrics.totalRequests,
        correctRate: langMetrics.totalRequests > 0 ? (langMetrics.correctDetections / langMetrics.totalRequests) * 100 : 0,
        ambiguousRate: langMetrics.totalRequests > 0 ? (langMetrics.ambiguousCases / langMetrics.totalRequests) * 100 : 0,
        frenchPercentage: langMetrics.totalRequests > 0 ? (langMetrics.frenchRequests / langMetrics.totalRequests) * 100 : 0,
        englishPercentage: langMetrics.totalRequests > 0 ? (langMetrics.englishRequests / langMetrics.totalRequests) * 100 : 0
      },
      responseQuality: {
        avgResponseTime: respMetrics.avgResponseTime,
        avgResponseLength: respMetrics.avgResponseLength,
        totalResponses: respMetrics.totalResponses,
        suggestionUsageRate: respMetrics.totalResponses > 0 ? (respMetrics.suggestionUsage / respMetrics.totalResponses) * 100 : 0,
        ctaUsageRate: respMetrics.totalResponses > 0 ? (respMetrics.ctaUsage / respMetrics.totalResponses) * 100 : 0,
        fallbackRate: respMetrics.totalResponses > 0 ? (respMetrics.fallbackUsage / respMetrics.totalResponses) * 100 : 0,
        userSatisfaction: respMetrics.userSatisfaction
      },
      generatedAt: new Date().toISOString()
    };
  }
}

// Export a singleton instance
export const chatbotMonitoring = new ChatbotMonitoring();

// Export types
export type { LanguageDetectionMetrics, ResponseQualityMetrics, ChatbotAnalytics };