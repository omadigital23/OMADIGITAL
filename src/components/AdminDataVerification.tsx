import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Database, Activity, RefreshCw } from 'lucide-react';

interface DataCheck {
  name: string;
  endpoint: string;
  status: 'checking' | 'success' | 'error' | 'mock';
  data?: any;
  message: string;
}

export function AdminDataVerification() {
  const [checks, setChecks] = useState<DataCheck[]>([
    {
      name: 'Analytics Data',
      endpoint: '/api/admin/analytics?period=7d',
      status: 'checking',
      message: 'Vérification...'
    },
    {
      name: 'Chatbot Conversations',
      endpoint: '/api/admin/chatbot-conversations',
      status: 'checking',
      message: 'Vérification...'
    },
    {
      name: 'A/B Tests',
      endpoint: '/api/admin/ab-tests',
      status: 'checking',
      message: 'Vérification...'
    },
    {
      name: 'Quotes',
      endpoint: '/api/admin/quotes',
      status: 'checking',
      message: 'Vérification...'
    }
  ]);

  const [overallStatus, setOverallStatus] = useState<'real' | 'mock' | 'mixed' | 'checking'>('checking');

  const checkEndpoint = async (check: DataCheck): Promise<DataCheck> => {
    try {
      const response = await fetch(check.endpoint);
      
      if (!response.ok) {
        return {
          ...check,
          status: 'error',
          message: `Erreur ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      
      // Analyze data to determine if it's real or mock
      const isRealData = analyzeData(check.name, data);
      
      return {
        ...check,
        status: isRealData ? 'success' : 'mock',
        data,
        message: isRealData ? 
          'Données réelles détectées ✅' : 
          'Données statiques/mock détectées ⚠️'
      };
    } catch (error) {
      return {
        ...check,
        status: 'error',
        message: `Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`
      };
    }
  };

  const analyzeData = (checkName: string, data: any): boolean => {
    switch (checkName) {
      case 'Analytics Data':
        // Check for dynamic timestamps and realistic data variations
        if (data.generated) {
          const generatedTime = new Date(data.generated);
          const now = new Date();
          const timeDiff = now.getTime() - generatedTime.getTime();
          
          // Data generated within last 10 minutes = likely real
          if (timeDiff < 10 * 60 * 1000) {
            return true;
          }
        }
        
        // Check for non-round numbers (sign of real data)
        if (data.analyticsEvents && data.analyticsEvents % 100 !== 0) {
          return true;
        }
        
        return false;

      case 'Chatbot Conversations':
        // Real data would have varied conversation lengths and timestamps
        if (Array.isArray(data) && data.length > 0) {
          return data.some(conv => conv.messages && conv.messages.length !== 5); // Varied lengths
        }
        return false;

      case 'A/B Tests':
        // Real A/B test data would have varied conversion rates
        if (Array.isArray(data) && data.length > 0) {
          return data.some(test => test.conversionRate && test.conversionRate % 1 !== 0); // Non-integer rates
        }
        return false;

      case 'Quotes':
        // Real quotes would have varied submission times
        if (Array.isArray(data) && data.length > 0) {
          const timestamps = data.map(q => new Date(q.created_at).getTime());
          const hasVariedTimes = new Set(timestamps).size > 1;
          return hasVariedTimes;
        }
        return false;

      default:
        return false;
    }
  };

  const runAllChecks = async () => {
    setChecks(prev => prev.map(check => ({ ...check, status: 'checking', message: 'Vérification...' })));
    
    const results = await Promise.all(checks.map(checkEndpoint));
    setChecks(results);
    
    // Determine overall status
    const realDataCount = results.filter(r => r.status === 'success').length;
    const mockDataCount = results.filter(r => r.status === 'mock').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    if (realDataCount === results.length) {
      setOverallStatus('real');
    } else if (mockDataCount === results.length || errorCount === results.length) {
      setOverallStatus('mock');
    } else {
      setOverallStatus('mixed');
    }
  };

  useEffect(() => {
    runAllChecks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'mock':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'checking':
      default:
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
    }
  };

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'real':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'mock':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'mixed':
        return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'checking':
      default:
        return 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  const getOverallMessage = () => {
    switch (overallStatus) {
      case 'real':
        return '🎉 Excellent! Votre admin utilise des données réelles de Supabase.';
      case 'mock':
        return '⚠️ Attention: Votre admin utilise des données statiques/mock.';
      case 'mixed':
        return '🔄 Mixte: Certaines données sont réelles, d\'autres sont statiques.';
      case 'checking':
      default:
        return '🔍 Vérification en cours...';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Database className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Vérification des Données</h2>
            <p className="text-gray-600">État des sources de données admin</p>
          </div>
        </div>
        
        <button
          onClick={runAllChecks}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Overall Status */}
      <div className={`border-l-4 p-4 rounded-lg mb-6 ${getOverallStatusColor()}`}>
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span className="font-medium">État Global</span>
        </div>
        <p className="mt-1">{getOverallMessage()}</p>
      </div>

      {/* Individual Checks */}
      <div className="space-y-4">
        {checks.map((check, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(check.status)}
                <div>
                  <h3 className="font-medium text-gray-900">{check.name}</h3>
                  <p className="text-sm text-gray-500">{check.endpoint}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  check.status === 'success' ? 'bg-green-100 text-green-800' :
                  check.status === 'error' ? 'bg-red-100 text-red-800' :
                  check.status === 'mock' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {check.status === 'success' ? 'Données Réelles' :
                   check.status === 'error' ? 'Erreur' :
                   check.status === 'mock' ? 'Données Mock' : 'Vérification...'}
                </div>
              </div>
            </div>
            
            <div className="mt-2">
              <p className="text-sm text-gray-600">{check.message}</p>
              
              {/* Show sample data for analysis */}
              {check.data && check.status !== 'checking' && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    Voir les données échantillon
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(
                      check.name === 'Analytics Data' ? {
                        analyticsEvents: check.data.analyticsEvents,
                        conversionRate: check.data.conversionRate,
                        generated: check.data.generated,
                        chats: check.data.chats
                      } : 
                      Array.isArray(check.data) ? 
                        check.data.slice(0, 2) : 
                        Object.keys(check.data).slice(0, 5).reduce((obj: any, key) => {
                          obj[key] = check.data[key];
                          return obj;
                        }, {}), 
                      null, 
                      2
                    )}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Recommandations</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          {overallStatus === 'mock' && (
            <>
              <li>• Vérifier la connexion à Supabase dans les variables d'environnement</li>
              <li>• Exécuter les migrations de base de données</li>
              <li>• Ajouter des données de test dans Supabase</li>
              <li>• Vérifier les politiques RLS (Row Level Security)</li>
            </>
          )}
          {overallStatus === 'mixed' && (
            <>
              <li>• Certains endpoints utilisent des données réelles, d'autres non</li>
              <li>• Vérifier les composants qui utilisent encore des données mock</li>
              <li>• Homogénéiser l'utilisation des APIs réelles</li>
            </>
          )}
          {overallStatus === 'real' && (
            <>
              <li>✅ Toutes les données proviennent de sources réelles</li>
              <li>✅ Votre admin est correctement connecté à Supabase</li>
              <li>✅ Les utilisateurs voient des données authentiques</li>
            </>
          )}
          <li>• Ouvrir les outils de développement → Onglet Réseau pour voir les appels API</li>
          <li>• Vérifier le tableau de bord Supabase pour les données stockées</li>
        </ul>
      </div>
    </div>
  );
}