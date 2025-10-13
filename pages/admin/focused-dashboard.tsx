import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Mail, MousePointer, MessageCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { withAdminAuth } from '../../src/utils/adminAuth';

// Define TypeScript interfaces for our data
interface NewsletterSubscriber {
  id: string;
  email: string;
  status: string;
  created_at: string;
  source: string;
}

interface QuoteSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  service: string;
  message: string;
  budget: string | null;
  status: string;
  created_at: string;
}

interface ChatbotConversation {
  id: string;
  session_id: string;
  user_message: string;
  bot_response: string;
  language: string;
  confidence: number;
  created_at: string;
}

interface ChatbotMessage {
  id: string;
  conversation_id: string;
  content: string;
  sender: string;
  created_at: string;
}

export const getServerSideProps = withAdminAuth(async () => ({ props: {} }));

export default function FocusedDashboard() {
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [quoteSubmissions, setQuoteSubmissions] = useState<QuoteSubmission[]>([]);
  const [chatbotConversations, setChatbotConversations] = useState<ChatbotConversation[]>([]);
  const [chatbotMessages, setChatbotMessages] = useState<ChatbotMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data for the three specified components
      const [newsletterRes, quotesRes, conversationsRes, messagesRes] = await Promise.all([
        fetch('/api/admin/fetch-newsletter-subscribers'),
        fetch('/api/admin/fetch-quote-submissions'),
        fetch('/api/admin/fetch-chatbot-conversations'),
        fetch('/api/admin/fetch-chatbot-messages')
      ]);

      if (newsletterRes.ok) {
        const result = await newsletterRes.json();
        setNewsletterSubscribers(result.data || []);
      }

      if (quotesRes.ok) {
        const result = await quotesRes.json();
        setQuoteSubmissions(result.data || []);
      }

      if (conversationsRes.ok) {
        const result = await conversationsRes.json();
        setChatbotConversations(result.data || []);
      }

      if (messagesRes.ok) {
        const result = await messagesRes.json();
        setChatbotMessages(result.data || []);
      }

      setLastUpdated(new Date().toLocaleTimeString('fr-FR'));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Focused</h1>
              <p className="text-gray-600 mt-1">
                {lastUpdated 
                  ? `Dernière mise à jour: ${lastUpdated}` 
                  : 'Chargement...'}
              </p>
            </div>
            
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Newsletter Block */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center">
              <Mail className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Abonnés Newsletter (Footer)</h2>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Total abonnés: {newsletterSubscribers.length}
                </p>
                
                {newsletterSubscribers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {newsletterSubscribers.slice(0, 10).map((subscriber) => (
                          <tr key={subscriber.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subscriber.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                subscriber.status === 'active' ? 'bg-green-100 text-green-800' :
                                subscriber.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {subscriber.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(subscriber.created_at).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscriber.source || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {newsletterSubscribers.length > 10 && (
                      <p className="mt-4 text-sm text-gray-500">
                        Affichage des 10 derniers abonnés sur {newsletterSubscribers.length} au total
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>Aucun abonné newsletter trouvé</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA Section Block */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center">
              <MousePointer className="h-6 w-6 text-green-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Soumissions CTA (@CTASection.tsx)</h2>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Total soumissions: {quoteSubmissions.length}
                </p>
                
                {quoteSubmissions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {quoteSubmissions.slice(0, 10).map((quote) => (
                          <tr key={quote.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quote.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quote.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quote.service}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {quoteSubmissions.length > 10 && (
                      <p className="mt-4 text-sm text-gray-500">
                        Affichage des 10 dernières soumissions sur {quoteSubmissions.length} au total
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MousePointer className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>Aucune soumission CTA trouvée</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SmartChatbotNext Block */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center">
              <MessageCircle className="h-6 w-6 text-purple-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Conversations Chatbot (@SmartChatbotNext.tsx)</h2>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Conversations totales</p>
                    <p className="text-2xl font-bold text-blue-700">{chatbotConversations.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Messages totaux</p>
                    <p className="text-2xl font-bold text-green-700">{chatbotMessages.length}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Langues utilisées</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {[
                        ...new Set(
                          chatbotConversations.map(c => c.language).filter(Boolean)
                        )
                      ].length}
                    </p>
                  </div>
                </div>
                
                {chatbotConversations.length > 0 ? (
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Dernières conversations</h3>
                    <div className="space-y-4">
                      {chatbotConversations.slice(0, 5).map((conversation) => (
                        <div key={conversation.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Session: {conversation.session_id.substring(0, 8)}...
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Utilisateur: {conversation.user_message.substring(0, 60)}...
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                Bot: {conversation.bot_response.substring(0, 60)}...
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                {new Date(conversation.created_at).toLocaleDateString('fr-FR')}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Confiance: {(conversation.confidence * 100).toFixed(0)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {chatbotConversations.length > 5 && (
                      <p className="mt-4 text-sm text-gray-500">
                        Affichage des 5 dernières conversations sur {chatbotConversations.length} au total
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>Aucune conversation chatbot trouvée</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}