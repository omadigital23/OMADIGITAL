interface MetricData {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

class SimpleMonitoring {
  private metrics: MetricData[] = [];
  
  track(name: string, value: number, tags?: Record<string, string>) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      tags
    });
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }
  
  getMetrics(name?: string) {
    return name ? this.metrics.filter(m => m.name === name) : this.metrics;
  }
  
  async logError(error: Error, context?: Record<string, any>) {
    console.error('Error:', error.message, context);
    this.track('error_count', 1, { error: error.message });
  }
}

export const monitoring = new SimpleMonitoring();