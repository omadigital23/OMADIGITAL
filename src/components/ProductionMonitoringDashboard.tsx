/**
 * Production Monitoring Dashboard
 * Real-time system health and performance monitoring
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Zap, 
  Shield, 
  TrendingUp,
  Server,
  Globe,
  Users,
  MessageSquare,
  Mail,
  FileText,
  RefreshCw
} from 'lucide-react';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceHealth;
    ai: ServiceHealth;
    security: ServiceHealth;
    performance: ServiceHealth;
  };
  metrics: {
    memory: MemoryMetrics;
    response_times: ResponseTimeMetrics;
    error_rates: ErrorRateMetrics;
  };
  dependencies: DependencyHealth[];
  response_time_ms?: number;
}

interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency_ms: number;
  last_check: string;
  error_count: number;
  details?: string;
}

interface MemoryMetrics {
  used_mb: number;
  total_mb: number;
  usage_percent: number;
  heap_used_mb: number;
}

interface ResponseTimeMetrics {
  avg_ms: number;
  p95_ms: number;
  p99_ms: number;
}

interface ErrorRateMetrics {
  last_hour: number;
  last_24h: number;
  critical_errors: number;
}

interface DependencyHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  url?: string;
  latency_ms?: number;
  error?: string;
}

interface SystemMetrics {
  total_quotes: number;
  total_subscribers: number;
  total_interactions: number;
  today_quotes: number;
  today_subscribers: number;
  today_interactions: number;
  error_rate: number;
  avg_response_time: number;
}

export function ProductionMonitoringDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch health status
  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (error) {
      console.error('Failed to fetch health status:', error);
    }
  };

  // Fetch system metrics
  const fetchSystemMetrics = async () => {
    try {
      const response = await fetch('/api/admin/system-metrics');
      if (response.ok) {
        const data = await response.json();
        setSystemMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchHealthStatus(),
      fetchSystemMetrics()
    ]);
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  // Auto-refresh effect
  useEffect(() => {
    refreshData();
    
    if (autoRefresh) {
      const interval = setInterval(refreshData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Status color helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5" />;
      case 'unhealthy': return <AlertTriangle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  if (isLoading && !healthStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading monitoring dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Activity className="w-8 h-8 mr-3 text-blue-600" />
                Production Monitoring
              </h1>
              <p className="text-gray-600 mt-2">
                Real-time system health and performance monitoring
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Auto-refresh</span>
              </label>
              
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Overall Status */}
        {healthStatus && (
          <div className="mb-8">
            <div className={`p-6 rounded-xl border-2 ${
              healthStatus.status === 'healthy' 
                ? 'border-green-200 bg-green-50' 
                : healthStatus.status === 'degraded'
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(healthStatus.status)}
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold capitalize">
                      System {healthStatus.status}
                    </h2>
                    <p className="text-gray-600">
                      Uptime: {Math.floor(healthStatus.uptime / 3600)}h {Math.floor((healthStatus.uptime % 3600) / 60)}m
                      {healthStatus.response_time_ms && (
                        <span className="ml-4">
                          Health check: {healthStatus.response_time_ms}ms
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-500">Version</div>
                  <div className="font-semibold">{healthStatus.version}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {healthStatus.environment}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Metrics Grid */}
        {systemMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Quotes</p>
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.total_quotes}</p>
                  <p className="text-sm text-green-600">+{systemMetrics.today_quotes} today</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Subscribers</p>
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.total_subscribers}</p>
                  <p className="text-sm text-green-600">+{systemMetrics.today_subscribers} today</p>
                </div>
                <Mail className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Chat Interactions</p>
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.total_interactions}</p>
                  <p className="text-sm text-green-600">+{systemMetrics.today_interactions} today</p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Error Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{systemMetrics.error_rate.toFixed(2)}%</p>
                  <p className="text-sm text-gray-500">Last 24h</p>
                </div>
                <TrendingUp className={`w-8 h-8 ${systemMetrics.error_rate > 5 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
            </div>
          </div>
        )}

        {/* Services Status */}
        {healthStatus && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Core Services */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Server className="w-5 h-5 mr-2 text-blue-600" />
                Core Services
              </h3>
              
              <div className="space-y-4">
                {Object.entries(healthStatus.services).map(([name, service]) => (
                  <div key={name} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${getStatusColor(service.status)}`}>
                        {name === 'database' && <Database className="w-4 h-4" />}
                        {name === 'ai' && <Zap className="w-4 h-4" />}
                        {name === 'security' && <Shield className="w-4 h-4" />}
                        {name === 'performance' && <TrendingUp className="w-4 h-4" />}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium capitalize">{name}</p>
                        {service.details && (
                          <p className="text-sm text-gray-500">{service.details}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-sm font-medium capitalize ${getStatusColor(service.status).split(' ')[0]}`}>
                        {service.status}
                      </p>
                      <p className="text-xs text-gray-500">{service.latency_ms}ms</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dependencies */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-green-600" />
                External Dependencies
              </h3>
              
              <div className="space-y-4">
                {healthStatus.dependencies.map((dep, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${getStatusColor(dep.status)}`}>
                        {getStatusIcon(dep.status)}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{dep.name}</p>
                        {dep.error && (
                          <p className="text-sm text-red-500">{dep.error}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-sm font-medium capitalize ${getStatusColor(dep.status).split(' ')[0]}`}>
                        {dep.status}
                      </p>
                      {dep.latency_ms && (
                        <p className="text-xs text-gray-500">{dep.latency_ms}ms</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {healthStatus && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Memory Usage */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Memory Usage</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Heap Used</span>
                    <span>{healthStatus.metrics.memory.usage_percent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        healthStatus.metrics.memory.usage_percent > 80 
                          ? 'bg-red-500' 
                          : healthStatus.metrics.memory.usage_percent > 60 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${healthStatus.metrics.memory.usage_percent}%` }}
                    />
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Used: {healthStatus.metrics.memory.used_mb} MB</p>
                  <p>Total: {healthStatus.metrics.memory.total_mb} MB</p>
                </div>
              </div>
            </div>

            {/* Response Times */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Response Times</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average</span>
                  <span className="font-medium">{healthStatus.metrics.response_times.avg_ms}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">95th Percentile</span>
                  <span className="font-medium">{healthStatus.metrics.response_times.p95_ms}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">99th Percentile</span>
                  <span className="font-medium">{healthStatus.metrics.response_times.p99_ms}ms</span>
                </div>
              </div>
            </div>

            {/* Error Rates */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Error Rates</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Hour</span>
                  <span className="font-medium">{healthStatus.metrics.error_rates.last_hour}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last 24h</span>
                  <span className="font-medium">{healthStatus.metrics.error_rates.last_24h}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Critical</span>
                  <span className={`font-medium ${
                    healthStatus.metrics.error_rates.critical_errors > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {healthStatus.metrics.error_rates.critical_errors}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}