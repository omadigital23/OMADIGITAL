import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, CheckCircle, Clock, Archive, Mail, Phone, Building, MessageSquare, AlertCircle } from 'lucide-react';

export function AdminQuotes() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [updatingQuote, setUpdatingQuote] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [quotes, searchTerm, statusFilter]);

  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/quotes');
      const data = await response.json();
      
      if (response.ok) {
        setQuotes(data.quotes);
        setStatusCounts(data.statusCounts);
      } else {
        setError(data.error || 'Failed to fetch quotes');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error fetching quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterQuotes = () => {
    let result = quotes;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(quote => 
        quote.name.toLowerCase().includes(term) ||
        quote.email.toLowerCase().includes(term) ||
        quote.company.toLowerCase().includes(term) ||
        quote.service.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(quote => quote.status === statusFilter);
    }
    
    setFilteredQuotes(result);
  };

  const updateQuoteStatus = async (quoteId: string, status: string, notes?: string) => {
    setUpdatingQuote(true);
    setUpdateError(null);
    
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update local state
        setQuotes(prevQuotes => 
          prevQuotes.map(quote => 
            quote.id === quoteId ? { ...quote, ...data.quote } : quote
          )
        );
        
        // Close modal if updating the selected quote
        if (selectedQuote && selectedQuote.id === quoteId) {
          setSelectedQuote(data.quote);
        }
        
        return true;
      } else {
        setUpdateError(data.error || 'Failed to update quote');
        return false;
      }
    } catch (err) {
      setUpdateError('An error occurred. Please try again.');
      console.error('Error updating quote:', err);
      return false;
    } finally {
      setUpdatingQuote(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nouveau': return 'bg-blue-100 text-blue-800';
      case 'en cours': return 'bg-yellow-100 text-yellow-800';
      case 'traité': return 'bg-green-100 text-green-800';
      case 'archivé': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'nouveau': return <Clock className="w-4 h-4" />;
      case 'en cours': return <Clock className="w-4 h-4" />;
      case 'traité': return <CheckCircle className="w-4 h-4" />;
      case 'archivé': return <Archive className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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
            onClick={fetchQuotes}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">Demandes de devis</h2>
        </div>
        <div className="text-sm text-gray-500">
          {filteredQuotes.length} résultat(s)
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, entreprise ou service..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="nouveau">Nouveau ({statusCounts.nouveau || 0})</option>
              <option value="en cours">En cours ({statusCounts['en cours'] || 0})</option>
              <option value="traité">Traité ({statusCounts.traite || 0})</option>
              <option value="archivé">Archivé ({statusCounts.archive || 0})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuotes.length > 0 ? (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{quote.name}</div>
                      <div className="text-sm text-gray-500">{quote.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{quote.service}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quote.budget}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                        {getStatusIcon(quote.status)}
                        <span className="ml-1">{quote.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedQuote(quote)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune demande de devis trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Détails du devis</h3>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  Fermer
                </button>
              </div>

              <div className="space-y-6">
                {/* Client Info */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Informations client</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Nom</div>
                      <div className="font-medium">{selectedQuote.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Entreprise</div>
                      <div className="font-medium">{selectedQuote.company}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedQuote.email}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Téléphone</div>
                      <div className="font-medium flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedQuote.phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Info */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Service demandé</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Service</div>
                      <div className="font-medium">{selectedQuote.service}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Budget</div>
                      <div className="font-medium">{selectedQuote.budget}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-gray-500 mb-1">Message</div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {selectedQuote.message}
                    </div>
                  </div>
                </div>

                {/* Status and Notes */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Statut et notes</h4>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Statut actuel</div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedQuote.status)}`}>
                      {getStatusIcon(selectedQuote.status)}
                      <span className="ml-1">{selectedQuote.status}</span>
                    </span>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau statut
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      defaultValue={selectedQuote.status}
                      onChange={(e) => updateQuoteStatus(selectedQuote.id, e.target.value)}
                      disabled={updatingQuote}
                    >
                      <option value="nouveau">Nouveau</option>
                      <option value="en cours">En cours</option>
                      <option value="traité">Traité</option>
                      <option value="archivé">Archivé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes administratives
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                      defaultValue={selectedQuote.admin_notes || ''}
                      placeholder="Ajoutez des notes sur ce devis..."
                      onBlur={(e) => updateQuoteStatus(selectedQuote.id, selectedQuote.status, e.target.value)}
                      disabled={updatingQuote}
                    />
                  </div>
                </div>

                {updateError && (
                  <div className="bg-red-50 text-red-800 p-3 rounded-lg">
                    {updateError}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedQuote(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}