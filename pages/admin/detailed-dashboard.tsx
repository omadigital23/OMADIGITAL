import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Mail, FileText, MessageCircle, RefreshCw, ChevronDown, ChevronUp, Search, Filter, LogOut } from 'lucide-react';
import { withAdminAuth } from '../../src/utils/adminAuth';

export const getServerSideProps = withAdminAuth(async () => ({ props: {} }));

interface NewsletterSubscriber {
  id: string;
  email: string;
  status: string;
  confirmation_token: string;
  subscribed_at: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
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
  location: string;
  status: string;
  created_at: string;
}

interface ChatbotConversation {
  id: string;
  session_id: string;
  user_message: string;
  bot_response: string;
  language: string;
  input_type: string;
  confidence: number | null;
  sentiment: string | null;
  lead_score: number | null;
  created_at: string;
}

export default function DetailedDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'newsletter' | 'quotes' | 'chatbot'>('newsletter');
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const response = await fetch('/api/admin/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  };
  
  // Newsletter data
  const [newsletterData, setNewsletterData] = useState<NewsletterSubscriber[]>([]);
  const [newsletterSearch, setNewsletterSearch] = useState('');
  const [newsletterFilter, setNewsletterFilter] = useState<'all' | 'active' | 'pending' | 'unsubscribed'>('all');
  
  // Quotes data
  const [quotesData, setQuotesData] = useState<QuoteSubmission[]>([]);
  const [quotesSearch, setQuotesSearch] = useState('');
  const [quotesFilter, setQuotesFilter] = useState<'all' | 'nouveau' | 'en_cours' | 'traité'>('all');
  
  // Chatbot data
  const [chatbotData, setChatbotData] = useState<ChatbotConversation[]>([]);
  const [chatbotSearch, setChatbotSearch] = useState('');
  const [chatbotFilter, setChatbotFilter] = useState<'all' | 'text' | 'voice'>('all');
  
  // Expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [newsletterRes, quotesRes, chatbotRes] = await Promise.all([
        fetch('/api/admin/newsletter-analytics'),
        fetch('/api/admin/quote-submissions'),
        fetch('/api/admin/chatbot-interactions?limit=100')
      ]);

      if (newsletterRes.ok) {
        const data = await newsletterRes.json();
        setNewsletterData(data.data?.subscribers || []);
      }

      if (quotesRes.ok) {
        const data = await quotesRes.json();
        setQuotesData(data.data?.quotes || []);
      }

      if (chatbotRes.ok) {
        const data = await chatbotRes.json();
        setChatbotData(data.interactions || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter newsletter data
  const filteredNewsletter = newsletterData.filter(item => {
    const matchesSearch = item.email.toLowerCase().includes(newsletterSearch.toLowerCase());
    const matchesFilter = newsletterFilter === 'all' || item.status === newsletterFilter;
    return matchesSearch && matchesFilter;
  });

  // Filter quotes data
  const filteredQuotes = quotesData.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(quotesSearch.toLowerCase()) ||
      item.email.toLowerCase().includes(quotesSearch.toLowerCase()) ||
      item.company?.toLowerCase().includes(quotesSearch.toLowerCase());
    const matchesFilter = quotesFilter === 'all' || item.status === quotesFilter;
    return matchesSearch && matchesFilter;
  });

  // Filter chatbot data
  const filteredChatbot = chatbotData.filter(item => {
    const matchesSearch = 
      item.user_message.toLowerCase().includes(chatbotSearch.toLowerCase()) ||
      item.bot_response.toLowerCase().includes(chatbotSearch.toLowerCase());
    const matchesFilter = chatbotFilter === 'all' || item.input_type === chatbotFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <Head>
        <title>Dashboard Détaillé - OMA Digital</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Détaillé</h1>
                <p className="text-gray-600 mt-1">Vue complète des données</p>
              </div>
              
              <div className="flex space-x-2">
                <Link href="/admin" className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                  Dashboard Simple
                </Link>
                
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
                
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {loggingOut ? 'Déconnexion...' : 'Déconnexion'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('newsletter')}
                className={`flex items-center px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'newsletter'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Mail className="w-5 h-5 mr-2" />
                Newsletter ({filteredNewsletter.length})
              </button>
              
              <button
                onClick={() => setActiveTab('quotes')}
                className={`flex items-center px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'quotes'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5 mr-2" />
                Demandes de Contact ({filteredQuotes.length})
              </button>
              
              <button
                onClick={() => setActiveTab('chatbot')}
                className={`flex items-center px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'chatbot'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Conversations Chatbot ({filteredChatbot.length})
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Newsletter Tab */}
          {activeTab === 'newsletter' && (
            <div className="bg-white rounded-lg shadow">
              {/* Search and Filter */}
              <div className="p-4 border-b border-gray-200 flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher par email..."
                    value={newsletterSearch}
                    onChange={(e) => setNewsletterSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="text-gray-400 w-5 h-5" />
                  <select
                    value={newsletterFilter}
                    onChange={(e) => setNewsletterFilter(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous</option>
                    <option value="active">Actifs</option>
                    <option value="pending">En attente</option>
                    <option value="unsubscribed">Désabonnés</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'abonnement</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de validation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredNewsletter.map((item) => (
                      <React.Fragment key={item.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === 'active' ? 'bg-green-100 text-green-800' :
                              item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.subscribed_at)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.confirmed_at)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => toggleRow(item.id)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              {expandedRows.has(item.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              <span className="ml-1">Détails</span>
                            </button>
                          </td>
                        </tr>
                        {expandedRows.has(item.id) && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 bg-gray-50">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-semibold">Token de confirmation:</span>
                                  <p className="text-gray-600 break-all">{item.confirmation_token || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-semibold">Date de désabonnement:</span>
                                  <p className="text-gray-600">{formatDate(item.unsubscribed_at)}</p>
                                </div>
                                <div>
                                  <span className="font-semibold">Date de création:</span>
                                  <p className="text-gray-600">{formatDate(item.created_at)}</p>
                                </div>
                                <div>
                                  <span className="font-semibold">ID:</span>
                                  <p className="text-gray-600 font-mono text-xs">{item.id}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
                
                {filteredNewsletter.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>Aucun abonné trouvé</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quotes Tab */}
          {activeTab === 'quotes' && (
            <div className="bg-white rounded-lg shadow">
              {/* Search and Filter */}
              <div className="p-4 border-b border-gray-200 flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, email, entreprise..."
                    value={quotesSearch}
                    onChange={(e) => setQuotesSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="text-gray-400 w-5 h-5" />
                  <select
                    value={quotesFilter}
                    onChange={(e) => setQuotesFilter(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">Tous</option>
                    <option value="nouveau">Nouveau</option>
                    <option value="en_cours">En cours</option>
                    <option value="traité">Traité</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredQuotes.map((item) => (
                      <React.Fragment key={item.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.service}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === 'nouveau' ? 'bg-blue-100 text-blue-800' :
                              item.status === 'en_cours' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.created_at)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => toggleRow(item.id)}
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              {expandedRows.has(item.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              <span className="ml-1">Détails</span>
                            </button>
                          </td>
                        </tr>
                        {expandedRows.has(item.id) && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 bg-gray-50">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-semibold">Téléphone:</span>
                                  <p className="text-gray-600">{item.phone}</p>
                                </div>
                                <div>
                                  <span className="font-semibold">Entreprise:</span>
                                  <p className="text-gray-600">{item.company || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-semibold">Budget:</span>
                                  <p className="text-gray-600">{item.budget || 'Non spécifié'}</p>
                                </div>
                                <div>
                                  <span className="font-semibold">Localisation:</span>
                                  <p className="text-gray-600">{item.location}</p>
                                </div>
                                <div className="col-span-2">
                                  <span className="font-semibold">Message:</span>
                                  <p className="text-gray-600 mt-1">{item.message}</p>
                                </div>
                                <div className="col-span-2">
                                  <span className="font-semibold">ID:</span>
                                  <p className="text-gray-600 font-mono text-xs">{item.id}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
                
                {filteredQuotes.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>Aucune demande trouvée</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chatbot Tab */}
          {activeTab === 'chatbot' && (
            <div className="bg-white rounded-lg shadow">
              {/* Search and Filter */}
              <div className="p-4 border-b border-gray-200 flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher dans les conversations..."
                    value={chatbotSearch}
                    onChange={(e) => setChatbotSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="text-gray-400 w-5 h-5" />
                  <select
                    value={chatbotFilter}
                    onChange={(e) => setChatbotFilter(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">Tous</option>
                    <option value="text">Texte</option>
                    <option value="voice">Voix</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message Utilisateur</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réponse Bot</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confiance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredChatbot.map((item) => (
                      <React.Fragment key={item.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.created_at)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{item.user_message}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.bot_response}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.input_type === 'voice' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.input_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.confidence ? `${(item.confidence * 100).toFixed(0)}%` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => toggleRow(item.id)}
                              className="text-purple-600 hover:text-purple-900 flex items-center"
                            >
                              {expandedRows.has(item.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              <span className="ml-1">Détails</span>
                            </button>
                          </td>
                        </tr>
                        {expandedRows.has(item.id) && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 bg-gray-50">
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-semibold">Session ID:</span>
                                    <p className="text-gray-600 font-mono text-xs">{item.session_id}</p>
                                  </div>
                                  <div>
                                    <span className="font-semibold">Langue:</span>
                                    <p className="text-gray-600">{item.language}</p>
                                  </div>
                                  <div>
                                    <span className="font-semibold">Sentiment:</span>
                                    <p className="text-gray-600">{item.sentiment || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="font-semibold">Score Lead:</span>
                                    <p className="text-gray-600">{item.lead_score ? `${item.lead_score}/100` : 'N/A'}</p>
                                  </div>
                                </div>
                                <div>
                                  <span className="font-semibold text-sm">Message complet:</span>
                                  <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-100">
                                    <p className="text-sm text-gray-700">{item.user_message}</p>
                                  </div>
                                </div>
                                <div>
                                  <span className="font-semibold text-sm">Réponse complète:</span>
                                  <div className="mt-2 p-3 bg-purple-50 rounded border border-purple-100">
                                    <p className="text-sm text-gray-700">{item.bot_response}</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
                
                {filteredChatbot.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>Aucune conversation trouvée</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
