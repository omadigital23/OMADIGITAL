import React, { useState, useEffect } from 'react';
import { abTestingService } from '../lib/ab-testing';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ABTestResult {
  testName: string;
  variants: {
    variant: string;
    conversions: number;
    assignments: number;
    conversionRate: number;
  }[];
  totalConversions: number;
  totalAssignments: number;
}

export function AdminABTestResults() {
  const [testResults, setTestResults] = useState<ABTestResult[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);

  useEffect(() => {
    // Get all tests
    const testConfigs = abTestingService.getTests();
    const testArray = Array.from(testConfigs.entries()).map(([testName, config]) => ({
      ...config,
      name: testName
    }));
    setTests(testArray);
    
    // Fetch results from our new API endpoint
    fetchTestResults();
  }, []);

  const fetchTestResults = async () => {
    setLoading(true);
    try {
      // Use our new API endpoint instead of the direct Supabase call
      const response = await fetch('/api/admin/ab-tests');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch A/B test results: ${response.status}`);
      }
      
      const data = await response.json();
      setTestResults(data.abTestResults);
      setTotalResults(data.totalResults);
      setTotalEvents(data.totalEvents);
    } catch (error) {
      console.error('Error fetching test results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const getChartData = (testName: string) => {
    const test = testResults.find(t => t.testName === testName);
    if (!test) return [];
    
    // Convert to chart format
    return test.variants.map((variant: any) => ({
      variant: variant.variant,
      count: variant.conversions
    }));
  };

  // Get conversion rates
  const getConversionRates = (testName: string) => {
    const test = testResults.find(t => t.testName === testName);
    if (!test) return [];
    
    return test.variants.map((variant: any) => ({
      variant: variant.variant,
      rate: variant.conversionRate,
      conversions: variant.conversions,
      assignments: variant.assignments
    }));
  };

  const COLORS = ['#f97316', '#ef4444'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Résultats des Tests A/B</h2>
        <p className="text-gray-600 mb-6">
          Analysez les performances de vos tests A/B pour optimiser les conversions.
        </p>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Tests Actifs</div>
            <div className="text-2xl font-bold text-gray-900">{tests.filter(t => t.enabled).length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Résultats Total</div>
            <div className="text-2xl font-bold text-gray-900">{totalResults.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Événements Analytics</div>
            <div className="text-2xl font-bold text-gray-900">{totalEvents.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {tests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Aucun test A/B configuré pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {tests.map((test) => (
            <div key={test.name} className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">{test.name}</h3>
                <p className="text-gray-600 mt-1">
                  Variants: {test.variants.join(', ')} | 
                  Statut: {test.enabled ? 'Actif' : 'Inactif'}
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Conversion Rate Chart */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Taux de Conversion</h4>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getConversionRates(test.name)}
                          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="variant" />
                          <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
                          <Tooltip 
                            formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Taux de conversion']}
                            labelFormatter={(value) => `Variant ${value}`}
                          />
                          <Legend />
                          <Bar dataKey="rate" name="Taux de conversion">
                            {getConversionRates(test.name).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Conversion Count Chart */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Conversions</h4>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getChartData(test.name)}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="variant"
                          >
                            {getChartData(test.name).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Conversions']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                {/* Detailed Stats */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {getConversionRates(test.name).map((variantData) => (
                    <div key={variantData.variant} className="bg-gray-50 rounded-lg p-4">
                      <div className="text-lg font-semibold text-gray-900">
                        Variant {variantData.variant}
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Assignments</div>
                          <div className="text-xl font-bold text-gray-900">{variantData.assignments}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Conversions</div>
                          <div className="text-xl font-bold text-gray-900">{variantData.conversions}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Taux</div>
                          <div className="text-xl font-bold text-gray-900">{variantData.rate.toFixed(2)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-2">Comment utiliser les tests A/B</h4>
        <ul className="list-disc list-inside text-blue-800 space-y-1">
          <li>Créez des variants de vos éléments de conversion (boutons, formulaires, etc.)</li>
          <li>Attribuez des poids pour contrôler la distribution des variants</li>
          <li>Analysez les taux de conversion pour identifier le meilleur variant</li>
          <li>Implémentez le variant gagnant une fois les résultats significatifs</li>
        </ul>
      </div>
    </div>
  );
}