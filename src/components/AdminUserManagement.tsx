import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Key, 
  Plus, 
  Edit3, 
  Trash2, 
  Search,
  Filter,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
  name: string;
}

export function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'admin@omadigital.sn',
      role: 'admin',
      status: 'active',
      lastLogin: '2025-01-25T14:30:00',
      createdAt: '2024-12-01T10:00:00',
      name: 'Administrateur Principal'
    },
    {
      id: '2',
      email: 'editor@omadigital.sn',
      role: 'editor',
      status: 'active',
      lastLogin: '2025-01-24T09:15:00',
      createdAt: '2024-12-15T14:30:00',
      name: 'Éditeur de Contenu'
    },
    {
      id: '3',
      email: 'viewer@omadigital.sn',
      role: 'viewer',
      status: 'inactive',
      lastLogin: '2025-01-10T16:45:00',
      createdAt: '2025-01-05T11:20:00',
      name: 'Visualiseur'
    },
    {
      id: '4',
      email: 'newuser@omadigital.sn',
      role: 'editor',
      status: 'pending',
      lastLogin: '',
      createdAt: '2025-01-25T18:30:00',
      name: 'Nouvel Utilisateur'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'editor' | 'viewer'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'editor' as 'admin' | 'editor' | 'viewer'
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    const user: User = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'pending',
      lastLogin: '',
      createdAt: new Date().toISOString()
    };
    
    setUsers(prev => [...prev, user]);
    setNewUser({ name: '', email: '', role: 'editor' });
    setShowAddUser(false);
    alert('Utilisateur ajouté avec succès ! Un email d\'invitation a été envoyé.');
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-500" />
            Gestion des Utilisateurs
          </h2>
          <p className="text-gray-600 mt-1">
            Administration des comptes et permissions
          </p>
        </div>
        
        <button
          onClick={() => setShowAddUser(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un nouvel utilisateur</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Nom de l'utilisateur"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="email@entreprise.sn"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="admin">Administrateur</option>
                  <option value="editor">Éditeur</option>
                  <option value="viewer">Visualiseur</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher des utilisateurs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="editor">Éditeurs</option>
              <option value="viewer">Visualiseurs</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
              <option value="pending">En attente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Utilisateur</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Rôle</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Statut</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Dernière connexion</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Date d'ajout</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role === 'admin' ? 'Administrateur' : 
                       user.role === 'editor' ? 'Éditeur' : 'Visualiseur'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status === 'active' ? <CheckCircle className="w-3 h-3" /> : 
                       user.status === 'inactive' ? <XCircle className="w-3 h-3" /> : null}
                      {user.status === 'active' ? 'Actif' : 
                       user.status === 'inactive' ? 'Inactif' : 'En attente'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-700">
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleDateString('fr-FR') 
                        : 'Jamais'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-700">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier l'utilisateur">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer l'utilisateur">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-600">
              Aucun utilisateur ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>

      {/* RLS Information */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Sécurité et Permissions
        </h3>
        <p className="text-blue-800 mb-3">
          Les rôles et permissions sont gérés via les règles de sécurité (RLS) de Supabase :
        </p>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• <strong>Administrateurs</strong> : Accès complet à toutes les fonctionnalités</li>
          <li>• <strong>Éditeurs</strong> : Peuvent créer et modifier du contenu</li>
          <li>• <strong>Visualiseurs</strong> : Accès en lecture seule aux données</li>
        </ul>
        <div className="mt-4 flex items-center gap-2 text-sm text-blue-700">
          <Key className="w-4 h-4" />
          <span>Toutes les connexions sont sécurisées avec JWT et OAuth2</span>
        </div>
      </div>
    </div>
  );
}