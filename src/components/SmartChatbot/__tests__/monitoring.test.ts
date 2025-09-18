import { chatbotMonitoring, LanguageDetectionMetrics, ResponseQualityMetrics } from '../utils/monitoring';

describe('Chatbot Monitoring', () => {
  beforeEach(() => {
    // Reset metrics before each test
    chatbotMonitoring.resetMetrics();
  });

  describe('Language Detection Tracking', () => {
    test('should track correct language detections', () => {
      chatbotMonitoring.trackLanguageDetection('fr', 'fr', 0.9);
      chatbotMonitoring.trackLanguageDetection('en', 'en', 0.85);
      
      const metrics = chatbotMonitoring.getMetrics();
      expect(metrics.languageDetection.totalRequests).toBe(2);
      expect(metrics.languageDetection.correctDetections).toBe(2);
      expect(metrics.languageDetection.incorrectDetections).toBe(0);
      expect(metrics.languageDetection.detectionAccuracy).toBe(100);
    });

    test('should track incorrect language detections', () => {
      chatbotMonitoring.trackLanguageDetection('fr', 'en', 0.9);
      chatbotMonitoring.trackLanguageDetection('en', 'fr', 0.85);
      
      const metrics = chatbotMonitoring.getMetrics();
      expect(metrics.languageDetection.totalRequests).toBe(2);
      expect(metrics.languageDetection.correctDetections).toBe(0);
      expect(metrics.languageDetection.incorrectDetections).toBe(2);
      expect(metrics.languageDetection.detectionAccuracy).toBe(0);
    });

    test('should track ambiguous cases', () => {
      chatbotMonitoring.trackLanguageDetection('fr', 'fr', 0.6);
      chatbotMonitoring.trackLanguageDetection('en', 'en', 0.65);
      chatbotMonitoring.trackLanguageDetection('fr', 'en', 0.9); // This is incorrect but high confidence
      
      const metrics = chatbotMonitoring.getMetrics();
      expect(metrics.languageDetection.ambiguousCases).toBe(2);
    });

    test('should track language distribution', () => {
      chatbotMonitoring.trackLanguageDetection('fr', 'fr', 0.9);
      chatbotMonitoring.trackLanguageDetection('fr', 'fr', 0.85);
      chatbotMonitoring.trackLanguageDetection('en', 'en', 0.92);
      
      const metrics = chatbotMonitoring.getMetrics();
      expect(metrics.languageDetection.frenchRequests).toBe(2);
      expect(metrics.languageDetection.englishRequests).toBe(1);
    });
  });

  describe('Response Quality Tracking', () => {
    test('should track response times and lengths', () => {
      chatbotMonitoring.trackResponseQuality(100, 150, false, false, false);
      chatbotMonitoring.trackResponseQuality(200, 300, true, true, false);
      
      const metrics = chatbotMonitoring.getMetrics();
      expect(metrics.responseQuality.totalResponses).toBe(2);
      expect(metrics.responseQuality.avgResponseTime).toBe(150);
      expect(metrics.responseQuality.avgResponseLength).toBe(225);
    });

    test('should track suggestion and CTA usage', () => {
      chatbotMonitoring.trackResponseQuality(100, 150, true, false, false);
      chatbotMonitoring.trackResponseQuality(200, 300, false, true, false);
      chatbotMonitoring.trackResponseQuality(150, 200, true, true, false);
      
      const metrics = chatbotMonitoring.getMetrics();
      expect(metrics.responseQuality.suggestionUsage).toBe(2);
      expect(metrics.responseQuality.ctaClicks).toBe(2);
    });

    test('should track fallback usage', () => {
      chatbotMonitoring.trackResponseQuality(100, 150, false, false, true);
      chatbotMonitoring.trackResponseQuality(200, 300, false, false, false);
      chatbotMonitoring.trackResponseQuality(150, 200, false, false, true);
      
      const metrics = chatbotMonitoring.getMetrics();
      expect(metrics.responseQuality.fallbackUsage).toBe(2);
    });
  });

  describe('User Satisfaction Tracking', () => {
    test('should track user satisfaction ratings', () => {
      // First track some responses to initialize the counter
      chatbotMonitoring.trackResponseQuality(100, 150, false, false, false);
      chatbotMonitoring.trackResponseQuality(200, 300, false, false, false);
      chatbotMonitoring.trackResponseQuality(150, 200, false, false, false);
      
      // Then track satisfaction
      chatbotMonitoring.trackUserSatisfaction(4);
      chatbotMonitoring.trackUserSatisfaction(5);
      chatbotMonitoring.trackUserSatisfaction(3);
      
      const metrics = chatbotMonitoring.getMetrics();
      expect(metrics.responseQuality.userSatisfaction).toBeCloseTo(4, 1);
    });
  });

  describe('Report Generation', () => {
    test('should generate a report', () => {
      // Add some data
      chatbotMonitoring.trackLanguageDetection('fr', 'fr', 0.9);
      chatbotMonitoring.trackLanguageDetection('en', 'en', 0.85);
      chatbotMonitoring.trackResponseQuality(100, 150, true, true, false);
      chatbotMonitoring.trackUserSatisfaction(4);
      
      const report = chatbotMonitoring.generateReport();
      expect(report).toContain('Chatbot Monitoring Report');
      expect(report).toContain('Language Detection:');
      expect(report).toContain('Response Quality:');
      expect(report).toContain('Total Requests: 2');
      expect(report).toContain('Detection Accuracy: 100.00%');
    });
  });

  describe('Metrics Reset', () => {
    test('should reset all metrics', () => {
      // Add some data
      chatbotMonitoring.trackLanguageDetection('fr', 'fr', 0.9);
      chatbotMonitoring.trackResponseQuality(100, 150, true, true, false);
      
      // Verify data was added
      let metrics = chatbotMonitoring.getMetrics();
      expect(metrics.languageDetection.totalRequests).toBe(1);
      expect(metrics.responseQuality.totalResponses).toBe(1);
      
      // Reset and verify
      chatbotMonitoring.resetMetrics();
      metrics = chatbotMonitoring.getMetrics();
      expect(metrics.languageDetection.totalRequests).toBe(0);
      expect(metrics.responseQuality.totalResponses).toBe(0);
    });
  });
});