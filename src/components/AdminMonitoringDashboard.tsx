import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PerformanceMetric {
  timestamp: string;
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
}

interface ChatbotInteraction {
  id: string;
  message_text: string;
  response_text: string;
  response_time: number;
  timestamp: string;
  language?: string;
  source?: string;
  confidence?: number;
}

interface AnalyticsEvent {
  event_name: string;
  event_properties?: Record<string, any>;
  timestamp: string;
  url: string;
  country?: string;
  device_type?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AdminMonitoringDashboard() {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [chatbotInteractions, setChatbotInteractions] = useState<ChatbotInteraction[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch performance metrics
        const performanceRes = await fetch('/api/admin/performance-metrics');
        const performanceData = await performanceRes.json();
        setPerformanceMetrics(performanceData.slice(-20)); // Last 20 entries

        // Fetch chatbot interactions
        const chatbotRes = await fetch('/api/admin/chatbot-interactions');
        const chatbotData = await chatbotRes.json();
        setChatbotInteractions(chatbotData.slice(-20)); // Last 20 entries

        // Fetch analytics events
        const analyticsRes = await fetch('/api/admin/analytics-events');
        const analyticsData = await analyticsRes.json();
        setAnalyticsEvents(analyticsData.slice(-20)); // Last 20 entries

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch monitoring data');
        setLoading(false);
        console.error('Error fetching monitoring data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const responseTimeData = chatbotInteractions.map(interaction => ({
    name: new Date(interaction.timestamp).toLocaleTimeString(),
    responseTime: interaction.response_time
  }));

  const languageDistribution = chatbotInteractions.reduce((acc, interaction) => {
    const lang = interaction.language || 'unknown';
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const languageData = Object.entries(languageDistribution).map(([name, value]) => ({
    name,
    value
  }));

  const eventTypes = analyticsEvents.reduce((acc, event) => {
    acc[event.event_name] = (acc[event.event_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const eventData = Object.entries(eventTypes).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : (
        <>
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="fcp" stroke="#8884d8" name="First Contentful Paint (ms)" />
                    <Line type="monotone" dataKey="lcp" stroke="#82ca9d" name="Largest Contentful Paint (ms)" />
                    <Line type="monotone" dataKey="fid" stroke="#ffc658" name="First Input Delay (ms)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chatbot Response Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Chatbot Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={responseTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="responseTime" fill="#0088FE" name="Response Time (ms)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Language Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Language Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={languageData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {languageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Events */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#FF8042" name="Event Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}