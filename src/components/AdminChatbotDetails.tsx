import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MessageSquare, User, Bot, Clock, Globe, Mic, AlertCircle } from 'lucide-react';

export function AdminChatbotDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchConversationDetails();
    }
  }, [id]);

  const fetchConversationDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/chatbot-details?id=${id}`);
      const data = await response.json();

      if (response.ok) {
        setConversation(data.conversation);
        setMessages(data.messages);
        setInteractions(data.interactions);
      } else {
        setError(data.error || 'Failed to fetch conversation details');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error fetching conversation details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchConversationDetails}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversation non trouvée</h3>
          <p className="text-gray-600 mb-4">La conversation demandée n'existe pas ou n'est plus disponible.</p>
          <button
            onClick={() => router.push('/admin')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">Détails de la conversation</h2>
        </div>
        <button
          onClick={() => router.push('/admin')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Retour
        </button>
      </div>

      {/* Conversation Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">Utilisateur</div>
          <div className="font-medium">
            {conversation.user_id ? `User ${conversation.user_id.substring(0, 8)}` : 'Anonymous'}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">Langue</div>
          <div className="font-medium">{conversation['language'] || 'N/A'}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">Score du lead</div>
          <div className="font-medium">{conversation.lead_score || 0}/100</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">Converti</div>
          <div className="font-medium">
            {conversation.is_converted ? (
              <span className="text-green-600">Oui</span>
            ) : (
              <span className="text-red-600">Non</span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center space-x-1 mb-1">
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                  <span className="text-xs font-medium">
                    {message.role === 'user' ? 'Utilisateur' : 'Chatbot'}
                  </span>
                </div>
                <div>{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interactions</h3>
        {interactions.length > 0 ? (
          <div className="space-y-4">
            {interactions.map((interaction, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Type d'entrée</div>
                    <div className="flex items-center space-x-1">
                      {interaction.input_method === 'voice' ? (
                        <Mic className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Globe className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="font-medium">
                        {interaction.input_method === 'voice' ? 'Voix' : 'Texte'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Temps de réponse</div>
                    <div className="font-medium">{interaction.response_time || 0}ms</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Horodatage</div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>
                        {new Date(interaction.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-500 mb-1">Message utilisateur</div>
                  <div className="bg-gray-50 p-2 rounded">{interaction.user_message}</div>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-500 mb-1">Réponse du chatbot</div>
                  <div className="bg-gray-50 p-2 rounded">{interaction.bot_response}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Aucune interaction enregistrée pour cette conversation
          </div>
        )}
      </div>
    </div>
  );
}