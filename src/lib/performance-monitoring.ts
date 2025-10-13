// Minimal placeholders to satisfy imports during build
export const PERFORMANCE_THRESHOLDS = {
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  fcp: 1800,
  ttfb: 600,
};

export const PERFORMANCE_BUDGETS = {
  sizeKB: 300,
  requests: 50,
};

export const pageSpeedService = {
  async analyzeUrl(url: string, strategy: 'mobile' | 'desktop') {
    return {
      url,
      strategy,
      scores: {
        performance: 90,
        accessibility: 95,
        bestPractices: 95,
        seo: 90,
      },
      coreWebVitals: { lcp: 2000, fid: 50, cls: 0.05, fcp: 1200, ttfb: 300 },
      metrics: { speedIndex: 1500, interactive: 2500, totalBlockingTime: 50 },
      opportunities: [],
      timestamp: new Date(),
    };
  },
};

export const alertService = {
  async getActiveAlerts() { return []; },
  async resolveAlert(_id: string) { return true; },
};

export const budgetService = {
  async checkBudgets(_data: any) {
    return { status: 'passing', violations: [] };
  },
};

export async function runPerformanceMonitoring(url: string) {
  const mobile = await pageSpeedService.analyzeUrl(url, 'mobile');
  const desktop = await pageSpeedService.analyzeUrl(url, 'desktop');
  return { mobile, desktop };
}
