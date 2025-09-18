import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MoreHorizontal,
  Eye,
  WifiOff
} from 'lucide-react';
import { t, Language } from '../lib/i18n';
import { AdminMonitoring } from '../utils/monitoring';

interface ChatSession {
  id: string;
  user: string;
  date: string;
  status: string;
  messageCount: number;
  lastMessage: string;
  type: string;
}

interface Conversation {
  id: string;
  user_id: string;
  session_id: string;
  language: string;
  context: any;
  metadata: any;
  created_at: string;
  updated_at: string;
  recentMessage: Message | null;
}

interface Message {
  id: string;
  conversation_id: string;
  content: string;
  sender: string;
  message_type: string;
  language: string;
  confidence: number;
  metadata: any;
  created_at: string;
}

// Add onViewDetails prop to the component
interface AdminChatbotSessionsProps {
  onViewDetails?: (sessionId: string) => void;
}

export function AdminChatbotSessions({ onViewDetails }: AdminChatbotSessionsProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'messages'>('date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('fr'); // Default to French
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 10;
  
  // Get current sessions
  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = filteredSessions.slice(indexOfFirstSession, indexOfLastSession);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);
  
  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Fetch dynamic data from Supabase
  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        // Fetch conversations through admin API to get statuses and types
        const response = await fetch('/api/admin/chatbot-conversations?limit=50');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch conversations: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const conversations = data.conversations || [];
        
        // Extract unique statuses from context
        const statuses = new Set<string>();
        conversations.forEach((conv: any) => {
          if (conv.context && conv.context.status) {
            statuses.add(conv.context.status);
          }
        });
        
        // Add default statuses if none found
        const defaultStatuses = ['active', 'completed', 'pending', 'new', 'in_progress', 'archived'];
        defaultStatuses.forEach(status => statuses.add(status));
        setAvailableStatuses(Array.from(statuses));

        // Extract unique types from context
        const types = new Set<string>();
        conversations.forEach((conv: any) => {
          if (conv.context && conv.context.type) {
            types.add(conv.context.type);
          }
        });
        
        // Add default types if none found
        const defaultTypes = ['support', 'sales', 'general', 'inquiry', 'complaint', 'feedback'];
        defaultTypes.forEach(type => types.add(type));
        setAvailableTypes(Array.from(types));
      } catch (err: any) {
        console.error('Error fetching dynamic data:', err);
        AdminMonitoring.logFallbackDataDisplayed('AdminChatbotSessions', err.message);
        setError(err.message);
      }
    };

    fetchDynamicData();
  }, []);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch conversations through admin API
        const response = await fetch('/api/admin/chatbot-conversations?limit=50');
        
        if (!response.ok) {
          AdminMonitoring.logDatabaseQuery('AdminChatbotSessions', 'conversations', false);
          throw new Error(`Failed to fetch conversations: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        AdminMonitoring.logDatabaseQuery('AdminChatbotSessions', 'conversations', true);
        AdminMonitoring.logDataProvenance('AdminChatbotSessions', 'conversations', 'Fetched through admin API');

        // Transform conversations to sessions for display
        const chatSessions: ChatSession[] = (data.conversations || []).map((conv: Conversation) => {
          const recentMessage = conv.recentMessage;
          const lastMessage = recentMessage ? recentMessage.content : 'No messages';
          const messageCount = recentMessage ? 1 : 0; // Simplified count
          
          return {
            id: conv.id,
            user: conv.user_id || 'Anonymous',
            date: new Date(conv.created_at).toLocaleDateString('fr-FR'),
            status: conv.context?.status || 'active',
            messageCount,
            lastMessage: lastMessage.length > 50 ? lastMessage.substring(0, 50) + '...' : lastMessage,
            type: conv.context?.type || 'general'
          };
        });
        
        setSessions(chatSessions);
        setFilteredSessions(chatSessions);

      } catch (err: any) {
        console.error('Error fetching conversations:', err);
        AdminMonitoring.logDatabaseQuery('AdminChatbotSessions', 'conversations', false);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    let result = [...sessions];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(session => 
        session.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(session => session.status === filterStatus);
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(session => session.type === filterType);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return b.messageCount - a.messageCount;
      }
    });
    
    setFilteredSessions(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [sessions, searchTerm, filterStatus, filterType, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'new': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'support': return 'bg-purple-100 text-purple-800';
      case 'sales': return 'bg-orange-100 text-orange-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      case 'inquiry': return 'bg-blue-100 text-blue-800';
      case 'complaint': return 'bg-red-100 text-red-800';
      case 'feedback': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Add translations for dynamic content
  const translateStatus = (status: string): string => {
    const key = `chatbot.sessions.table.status.${status}`;
    return t(key, language) === key ? status : t(key, language);
  };

  const translateType = (type: string): string => {
    const key = `chatbot.sessions.table.type.${type}`;
    return t(key, language) === key ? type : t(key, language);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="ml-4 text-gray-600">{t('chatbot.sessions.loading', language)}</span>
        </div>
      </div>
    );
  }

  // Show error page instead of fallback data
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <WifiOff className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('chatbot.sessions.error.title', language)}</h3>
          <p className="text-gray-600 mb-4">
            {t('chatbot.sessions.error.message', language)}
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
            <p className="text-red-700 text-sm font-mono">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-orange-500" />
            {t('chatbot.sessions.title', language)}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('chatbot.sessions.description', language)}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('chatbot.sessions.search.placeholder', language)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">{t('chatbot.sessions.filters.status.all', language)}</option>
              {availableStatuses.map(status => (
                <option key={status} value={status}>
                  {translateStatus(status)}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">{t('chatbot.sessions.filters.type.all', language)}</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>
                  {translateType(type)}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="date">{t('chatbot.sessions.sort.date', language)}</option>
              <option value="messages">{t('chatbot.sessions.sort.messages', language)}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-700">{t('chatbot.sessions.table.user', language)}</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">{t('chatbot.sessions.table.date', language)}</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">{t('chatbot.sessions.table.status', language)}</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">{t('chatbot.sessions.table.type', language)}</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">{t('chatbot.sessions.table.messages', language)}</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">{t('chatbot.sessions.table.lastMessage', language)}</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">{t('chatbot.sessions.table.actions', language)}</th>
              </tr>
            </thead>
            <tbody>
              {currentSessions.map((session: ChatSession) => (
                <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{session.user}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(session.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(session.date).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {session.status === 'active' && <CheckCircle className="w-3 h-3" />}
                      {session.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                      {session.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                      {translateStatus(session.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(session.type)}`}>
                      {translateType(session.type)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-700">
                      {session.messageCount} messages
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {session.lastMessage}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t('chatbot.sessions.table.actions.view', language) || "Voir les détails"}
                        onClick={() => onViewDetails && onViewDetails(session.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title={t('chatbot.sessions.table.actions.more', language) || "Plus d'options"}>
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredSessions.length > sessionsPerPage && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstSession + 1}</span> to <span className="font-medium">{Math.min(indexOfLastSession, filteredSessions.length)}</span> of{' '}
              <span className="font-medium">{filteredSessions.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Previous
              </button>
              
              {pageNumbers.map((number: number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 rounded-md ${currentPage === number ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {number}
                </button>
              ))}
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('chatbot.sessions.noResults.title', language)}</h3>
            <p className="text-gray-600">
              {t('chatbot.sessions.noResults', language)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}