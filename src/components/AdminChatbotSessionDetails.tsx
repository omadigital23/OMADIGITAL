import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Send, 
  User, 
  Bot, 
  MessageCircle, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Plus,
  Edit3,
  Trash2,
  MessageSquare,
  WifiOff,
  Loader2
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
  cta?: {
    text: string;
    link: string;
  };
}

interface SessionDetail {
  id: string;
  user: string;
  date: string;
  status: 'active' | 'completed' | 'pending';
  messageCount: number;
  messages: Message[];
  internalNotes: string;
  language: string;
  context?: any;
  metadata?: any;
}

interface AdminChatbotSessionDetailsProps {
  sessionId?: string;
  onBack?: () => void;
}

export function AdminChatbotSessionDetails({ sessionId, onBack }: AdminChatbotSessionDetailsProps) {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails(sessionId);
    }
  }, [sessionId]);

  const fetchSessionDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/chatbot-details?id=${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch session details: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform the data to match our SessionDetail interface
      const transformedSession: SessionDetail = {
        id: data.conversation.id,
        user: data.conversation.user_id === 'anonymous' ? 'Anonymous User' : (data.conversation.user_id || 'Unknown User'),
        date: data.conversation.created_at,
        status: data.conversation.context?.status || 'completed',
        messageCount: data.messages.length,
        language: data.conversation.language || 'fr',
        context: data.conversation.context || {},
        metadata: data.conversation.metadata || {},
        messages: data.messages.map((msg: any) => ({
          id: msg.id,
          sender: msg.sender === 'user' ? 'user' : 'bot',
          content: msg.content,
          timestamp: msg.created_at,
          cta: msg.metadata?.cta ? {
            text: msg.metadata.cta.text,
            link: msg.metadata.cta.link
          } : undefined
        })),
        internalNotes: data.conversation.metadata?.internalNotes || 'No internal notes available'
      };
      
      setSession(transformedSession);
      setInternalNotes(transformedSession.internalNotes);
    } catch (err) {
      console.error('Error fetching session details:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'new': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendMessage = () => {
    if (replyMessage.trim()) {
      // In a real app, this would send the message to the user
      console.log('Sending message:', replyMessage);
      setReplyMessage('');
    }
  };

  const handleSaveNotes = () => {
    // In a real app, this would save the notes to the database
    console.log('Saving notes:', internalNotes);
    setIsEditingNotes(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <WifiOff className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Session</h3>
          <p className="text-gray-600 mb-4">
            There was an error loading the chatbot session details.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
            <p className="text-red-700 text-sm font-mono">{error}</p>
          </div>
          <button
            onClick={onBack}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Not Found</h3>
          <p className="text-gray-600">
            The requested chatbot session could not be found.
          </p>
          <button
            onClick={onBack}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-orange-500" />
              Chatbot Session
            </h2>
            <p className="text-gray-600 mt-1">
              Conversation with {session.user}
            </p>
          </div>
        </div>
        
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
          {session.status === 'active' && <CheckCircle className="w-4 h-4" />}
          {session.status === 'completed' && <CheckCircle className="w-4 h-4" />}
          {session.status === 'pending' && <AlertCircle className="w-4 h-4" />}
          {session.status.charAt(0).toUpperCase() + session.status.slice(1).replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Messages */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{session.user}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(session.date).toLocaleDateString()}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {session.messageCount} messages
              </div>
            </div>

            {/* Chat Messages */}
            <div className="space-y-6 mb-6 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
              {session.messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${message.sender === 'user' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200'} rounded-2xl px-4 py-3`}>
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === 'bot' ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span className="text-xs font-medium">
                        {message.sender === 'bot' ? 'Assistant OMA' : session.user}
                      </span>
                      <span className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap">
                      {message.content}
                    </div>
                    {message.cta && (
                      <div className="mt-2">
                        <button className="flex items-center gap-1 text-xs font-medium underline">
                          <ExternalLink className="w-3 h-3" />
                          {message.cta.text}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Box */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Reply to the user..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                You can intervene in the conversation to correct or improve the bot's responses.
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Session Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              Session Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Session ID</span>
                <span className="font-mono text-sm">{session.id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Language</span>
                <span className="font-medium">{session.language === 'fr' ? 'French' : 'English'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Messages</span>
                <span className="font-medium">{session.messageCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1).replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Started</span>
                <span className="text-sm">{new Date(session.date).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Context Information */}
          {session.context && Object.keys(session.context).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                Context Information
              </h3>
              <div className="space-y-2">
                {Object.entries(session.context).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-sm max-w-[50%] truncate">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internal Notes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                Internal Notes
              </h3>
              {isEditingNotes ? (
                <button
                  onClick={handleSaveNotes}
                  className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md flex items-center gap-1"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
            
            {isEditingNotes ? (
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Add internal notes for tracking this session..."
              />
            ) : (
              <div className="text-gray-700 whitespace-pre-wrap">
                {internalNotes || <span className="text-gray-400 italic">No internal notes</span>}
              </div>
            )}
          </div>

          {/* Session Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Add Note
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Edit3 className="w-4 h-4" />
                Correct Response
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Trash2 className="w-4 h-4" />
                Archive Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}